import os
import uuid
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import timedelta, datetime
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from models import Base, User, Salon, Member, SynthesisHistory, RefreshToken
import models, schemas, auth, database

load_dotenv()

# Initialize DB tables
models.Base.metadata.create_all(bind=database.engine)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="HairFit API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "profiles").mkdir(exist_ok=True)
(UPLOAD_DIR / "originals").mkdir(exist_ok=True)
(UPLOAD_DIR / "results").mkdir(exist_ok=True)

# CORS 설정 (환경변수로 제어)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

@app.get("/")
def read_root():
    return {"message": "Welcome to HairFit API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- Auth Endpoints ---

@app.post("/register", response_model=schemas.Token)
@limiter.limit("5/hour")  # 5 registrations per hour per IP
def register_user(request: Request, user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    print(f"Register request received: email={user.email}, username={user.username}")
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        print(f"Email already registered: {user.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    print(f"Registering user: {user.email}, Password length: {len(user.password)}")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create default salon for user
    salon_name = user.salon_name if user.salon_name else f"{user.username}'s Salon"
    new_salon = models.Salon(name=salon_name, owner_id=new_user.id)
    db.add(new_salon)
    db.commit()

    # Generate tokens for auto-login after registration
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    refresh_token = auth.create_refresh_token(new_user.id, db)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/login", response_model=schemas.Token)
@limiter.limit("10/minute")  # 10 login attempts per minute per IP
def login_for_access_token(request: Request, user_login: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_login.email).first()
    if not user or not auth.verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    refresh_token = auth.create_refresh_token(user.id, db)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

@app.post("/login/google", response_model=schemas.Token)
def login_google(token_data: schemas.GoogleLogin, db: Session = Depends(database.get_db)):
    try:
        email = None
        username = None

        if token_data.id_token:
            # Verify the ID token
            idinfo = id_token.verify_oauth2_token(token_data.id_token, requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo['email']
            username = idinfo.get('name', email.split('@')[0])
        elif token_data.access_token:
            # Verify the Access Token by fetching user info
            import requests as req
            userinfo_response = req.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token_data.access_token}"}
            )
            
            if userinfo_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google Access Token")
            
            userinfo = userinfo_response.json()
            email = userinfo.get('email')
            username = userinfo.get('name', email.split('@')[0])
        else:
             raise HTTPException(status_code=400, detail="Either id_token or access_token is required")

        if not email:
            raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            print(f"Auto-registering Google user: {email}")
            # Auto-register user with a dummy password (they can't login with password unless they reset it)
            # Using a random UUID as password to prevent guessing
            dummy_password = str(uuid.uuid4())
            hashed_password = auth.get_password_hash(dummy_password)
            
            new_user = models.User(email=email, username=username, hashed_password=hashed_password)
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user
            
            # Create default salon for user
            salon_name = f"{user.username}'s Salon"
            new_salon = models.Salon(name=salon_name, owner_id=new_user.id)
            db.add(new_salon)
            db.commit()

        # Generate JWT tokens (same as regular login)
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        # Revoke old refresh tokens if needed, or just create a new one
        refresh_token = auth.create_refresh_token(user.id, db)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except ValueError as e:
        print(f"Google Token Verification Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google Token")
    except Exception as e:
        print(f"Google Login Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.post("/refresh", response_model=schemas.Token)
@limiter.limit("20/minute")  # 20 refresh requests per minute per IP
def refresh_access_token(request: Request, token_refresh: schemas.TokenRefresh, db: Session = Depends(database.get_db)):
    user = auth.verify_refresh_token(token_refresh.refresh_token, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new access token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    # Optionally create new refresh token (rotate refresh tokens)
    # Revoke old refresh token
    auth.revoke_refresh_token(token_refresh.refresh_token, db)

    # Create new refresh token
    new_refresh_token = auth.create_refresh_token(user.id, db)

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@app.post("/logout")
def logout(token_refresh: schemas.TokenRefresh, db: Session = Depends(database.get_db)):
    auth.revoke_refresh_token(token_refresh.refresh_token, db)
    return {"message": "Successfully logged out"}

# --- AI Synthesis Endpoints ---

import base64

# 스타일 ID와 참조 이미지 경로 매핑 (동적으로 관리)
STYLE_IMAGES = {}

def load_style_images():
    """Load all style images from assets/styles directory"""
    global STYLE_IMAGES
    STYLE_IMAGES.clear()

    styles_dir = Path("assets/styles")
    if not styles_dir.exists():
        styles_dir.mkdir(parents=True, exist_ok=True)
        return

    # Scan for image files
    for file_path in styles_dir.glob("*"):
        if file_path.is_file() and file_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
            # Extract style_id from filename (e.g., style_1.jpg -> style_1)
            style_id = file_path.stem
            if style_id.startswith("style_"):
                # Convert Windows backslashes to forward slashes for consistency
                STYLE_IMAGES[style_id] = str(file_path).replace('\\', '/')

    print(f"Loaded {len(STYLE_IMAGES)} style images: {list(STYLE_IMAGES.keys())}")

@app.on_event("startup")
async def startup_event():
    print("Server starting up...")

    # Load style images from assets/styles directory
    load_style_images()

    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        print("Listing available models...")
        try:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    print(f"Found model: {m.name}")
        except Exception as e:
            print(f"Error listing models: {e}")
    else:
        print("GEMINI_API_KEY is not set.")

@app.post("/synthesize")
@limiter.limit("10/hour")  # 10 synthesis requests per hour per IP
async def synthesize_hair(
    request: Request,
    file: UploadFile = File(...),
    style_id: str = Form(...),
    current_user: models.User = Depends(auth.get_current_user)  # Now protected
):
    print(f"Request received. Style ID: {style_id}")
    
    if not GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY is not set")
        return {"error": "GEMINI_API_KEY is not set"}

    try:
        # 변경 대상 이미지 데이터 읽기
        image_bytes = await file.read()
        print(f"Input image read successfully. Size: {len(image_bytes)} bytes")

        # PIL 이미지로 변환 (Gemini 입력용)
        import io
        from PIL import Image
        input_image = Image.open(io.BytesIO(image_bytes))

        # 참조 스타일 이미지 로드
        style_image_path = STYLE_IMAGES.get(style_id)
        if not style_image_path:
            return {"error": f"Invalid style_id: {style_id}"}

        if not os.path.exists(style_image_path):
            return {"error": f"Style image not found: {style_image_path}"}

        reference_image = Image.open(style_image_path)
        print(f"Reference style image loaded: {style_image_path}")

        # 프롬프트 구성
        prompt = (
            "Apply the hairstyle from the reference image (second image) to the person in the first image. "
            "IMPORTANT: Keep the person's face, facial features, skin tone, and background EXACTLY the same. "
            "DO NOT change the person's identity, face shape, or any facial features. "
            "ONLY change the hairstyle to match the reference image. "
            "Ensure the result looks natural and photorealistic. "
            "Output only the modified image."
        )
        print(f"Prompt: {prompt}")

        # Gemini 모델 로드
        model_name = 'gemini-3-pro-image-preview'
        print(f"Loading Gemini model: {model_name}...")
        model = genai.GenerativeModel(model_name)

        # API 호출 - 변경 대상 이미지와 참조 스타일 이미지 함께 전송
        print("Calling Gemini API with input image and reference style image...")
        response = model.generate_content([prompt, input_image, reference_image])
        print("Gemini API call completed.")

        # 응답 디버깅 정보 출력
        print(f"Response object: {response}")
        print(f"Number of candidates: {len(response.candidates) if response.candidates else 0}")

        # Prompt feedback 확인 (안전 필터 등)
        if hasattr(response, 'prompt_feedback'):
            print(f"Prompt feedback: {response.prompt_feedback}")

        # 응답 처리
        ai_message = "No response"
        generated_image_base64 = None

        if response.candidates:
            candidate = response.candidates[0]
            print(f"Candidate finish_reason: {candidate.finish_reason}")
            print(f"Candidate safety_ratings: {candidate.safety_ratings if hasattr(candidate, 'safety_ratings') else 'N/A'}")

            if candidate.content and candidate.content.parts:
                for part in candidate.content.parts:
                    if part.text:
                        ai_message = part.text
                        print(f"Text response: {ai_message}")

                    # 이미지 데이터 확인 (inline_data 또는 다른 형식)
                    if hasattr(part, 'inline_data') and part.inline_data:
                        print("Image response received!")
                        generated_image_base64 = base64.b64encode(part.inline_data.data).decode('utf-8')
                        ai_message = "Image generated successfully"
                        break
            else:
                ai_message = f"No content. Finish reason: {candidate.finish_reason}"
        else:
            ai_message = "No candidates returned"
            # Check if blocked by safety filters
            if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                ai_message += f" - Prompt feedback: {response.prompt_feedback}"

        print(f"Gemini Response Message: {ai_message}")

        # 생성된 이미지가 있으면 그것을 사용, 없으면 에러 반환
        if generated_image_base64:
            final_image_data = generated_image_base64
        else:
            print("Error: No image generated by AI.")
            raise HTTPException(status_code=500, detail=f"Failed to generate image: {ai_message}")

        return {"result_image": final_image_data}

    except Exception as e:
        print(f"Error occurred: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

# --- Style Management Endpoints ---

@app.get("/styles")
async def get_styles(current_user: models.User = Depends(auth.get_current_user)):
    """Get list of available hairstyles"""
    try:
        styles = []
        for style_id, image_path in STYLE_IMAGES.items():
            style_info = {
                "id": style_id,
                "name": style_id.replace("_", " ").title(),
                "image_path": image_path.replace("assets/", ""),
                "exists": os.path.exists(image_path)
            }
            styles.append(style_info)

        return {"styles": styles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/styles")
@limiter.limit("10/hour")  # 10 uploads per hour
async def upload_style(
    request: Request,
    file: UploadFile = File(...),
    style_id: str = Form(None),  # Optional, will auto-generate if not provided
    current_user: models.User = Depends(auth.get_current_user)
):
    """Upload a new hairstyle reference image"""
    try:
        # Auto-generate style_id if not provided
        if not style_id:
            # Find the next available style number
            existing_numbers = []
            for existing_id in STYLE_IMAGES.keys():
                if existing_id.startswith("style_"):
                    try:
                        num = int(existing_id.replace("style_", ""))
                        existing_numbers.append(num)
                    except ValueError:
                        continue

            next_number = max(existing_numbers, default=0) + 1
            style_id = f"style_{next_number}"
            print(f"Auto-generated style_id: {style_id}")

        # Validate style_id format
        if not style_id.startswith("style_"):
            raise HTTPException(status_code=400, detail="style_id must start with 'style_'")

        # Check if style_id already exists
        if style_id in STYLE_IMAGES:
            raise HTTPException(status_code=400, detail=f"Style ID '{style_id}' already exists")

        # Save file to assets/styles directory
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{style_id}.{file_extension}"
        file_path = f"assets/styles/{filename}"

        # Create directory if not exists
        os.makedirs("assets/styles", exist_ok=True)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Update STYLE_IMAGES mapping
        STYLE_IMAGES[style_id] = file_path

        return {
            "message": "Style uploaded successfully",
            "style_id": style_id,
            "file_path": file_path
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/styles/{style_id}")
async def delete_style(
    style_id: str,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Delete a hairstyle reference image"""
    try:
        if style_id not in STYLE_IMAGES:
            raise HTTPException(status_code=404, detail="Style not found")

        file_path = STYLE_IMAGES[style_id]

        # Delete file if exists
        if os.path.exists(file_path):
            os.remove(file_path)

        # Remove from mapping
        del STYLE_IMAGES[style_id]

        return {"message": "Style deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Helper function to get user's salon ---
def get_user_salon(current_user: models.User, db: Session) -> models.Salon:
    salon = db.query(models.Salon).filter(models.Salon.owner_id == current_user.id).first()
    if not salon:
        # Auto-create salon if it doesn't exist
        salon_name = f"{current_user.username}'s Salon"
        salon = models.Salon(name=salon_name, owner_id=current_user.id)
        db.add(salon)
        db.commit()
        db.refresh(salon)
        print(f"Auto-created salon for user {current_user.email}")
    return salon

# --- Image Upload Endpoints ---

@app.post("/upload/profile-photo")
@limiter.limit("20/hour")  # 20 uploads per hour per user
async def upload_profile_photo(
    request: Request,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / "profiles" / filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"photo_path": f"profiles/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.post("/upload/result-photo")
@limiter.limit("20/hour")
async def upload_result_photo(
    request: Request,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'png'
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / "results" / filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"photo_path": f"results/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.post("/upload/original-photo")
@limiter.limit("20/hour")
async def upload_original_photo(
    request: Request,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / "originals" / filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"photo_path": f"originals/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.get("/images/{image_type}/{filename}")
async def get_image(image_type: str, filename: str):
    # Handle style images from assets directory
    if image_type == "styles":
        file_path = Path("assets") / "styles" / filename
    else:
        file_path = UPLOAD_DIR / image_type / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

# --- Member CRUD Endpoints ---

@app.get("/members", response_model=list[schemas.MemberResponse])
async def get_members(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)
    members = db.query(models.Member).filter(models.Member.salon_id == salon.id).order_by(models.Member.created_at.desc()).all()
    return members

@app.get("/members/{member_id}", response_model=schemas.MemberResponse)
async def get_member(
    member_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)
    member = db.query(models.Member).filter(
        models.Member.id == member_id,
        models.Member.salon_id == salon.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    return member

@app.post("/members", response_model=schemas.MemberResponse)
async def create_member(
    member: schemas.MemberCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)

    new_member = models.Member(
        id=str(uuid.uuid4()),
        salon_id=salon.id,
        name=member.name,
        phone=member.phone,
        memo=member.memo,
        photo_path=member.photo_path,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member

@app.put("/members/{member_id}", response_model=schemas.MemberResponse)
async def update_member(
    member_id: str,
    member_update: schemas.MemberUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)

    member = db.query(models.Member).filter(
        models.Member.id == member_id,
        models.Member.salon_id == salon.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    update_data = member_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(member, key, value)

    member.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(member)

    return member

@app.delete("/members/{member_id}")
async def delete_member(
    member_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)

    member = db.query(models.Member).filter(
        models.Member.id == member_id,
        models.Member.salon_id == salon.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()

    return {"message": "Member deleted successfully"}

# --- SynthesisHistory Endpoints ---

@app.get("/synthesis-history", response_model=list[schemas.SynthesisHistoryResponse])
async def get_synthesis_history(
    member_id: str = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)

    # Use LEFT JOIN to include synthesis history without member_id
    # Filter to show only records for the current user's salon
    # For records without member_id, show all for this user
    query = db.query(models.SynthesisHistory).outerjoin(models.Member).filter(
        (models.Member.salon_id == salon.id) | (models.SynthesisHistory.member_id == None)
    )

    if member_id:
        query = query.filter(models.SynthesisHistory.member_id == member_id)

    history = query.order_by(models.SynthesisHistory.created_at.desc()).all()
    return history

@app.post("/synthesis-history", response_model=schemas.SynthesisHistoryResponse)
async def create_synthesis_history(
    history: schemas.SynthesisHistoryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    salon = get_user_salon(current_user, db)

    # Verify member belongs to user's salon if member_id is provided
    if history.member_id:
        member = db.query(models.Member).filter(
            models.Member.id == history.member_id,
            models.Member.salon_id == salon.id
        ).first()

        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

    new_history = models.SynthesisHistory(
        id=str(uuid.uuid4()),
        member_id=history.member_id,
        original_photo_path=history.original_photo_path,
        reference_style_id=history.reference_style_id,
        result_photo_path=history.result_photo_path,
        is_synced=True,
        created_at=datetime.utcnow()
    )

    db.add(new_history)
    db.commit()
    db.refresh(new_history)

    return new_history

@app.get("/synthesis-history/{history_id}", response_model=schemas.SynthesisHistoryResponse)
async def get_synthesis_history_item(
    history_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    history = db.query(models.SynthesisHistory).filter(models.SynthesisHistory.id == history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="History item not found")
    return history

@app.delete("/synthesis-history/{history_id}")
async def delete_synthesis_history(
    history_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    history = db.query(models.SynthesisHistory).filter(models.SynthesisHistory.id == history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="History item not found")

    # Delete files if needed (implementation omitted for brevity, logic should handle file cleanup)
    
    db.delete(history)
    db.commit()
    return {"message": "History deleted successfully"}
