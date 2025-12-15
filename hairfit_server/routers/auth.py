import os
import uuid
import requests as req
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

import models, schemas, auth_utils as auth, database
from dependencies import limiter

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

@router.post("/register", response_model=schemas.Token)
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

@router.post("/login", response_model=schemas.Token)
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

@router.post("/login/google", response_model=schemas.Token)
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

@router.post("/refresh", response_model=schemas.Token)
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

@router.post("/logout")
def logout(token_refresh: schemas.TokenRefresh, db: Session = Depends(database.get_db)):
    auth.revoke_refresh_token(token_refresh.refresh_token, db)
    return {"message": "Successfully logged out"}
