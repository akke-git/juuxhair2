import shutil
import uuid
import os
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse

import models, auth_utils as auth
from dependencies import limiter

router = APIRouter()

UPLOAD_DIR = Path("uploads")
# Ensure directories exist (might be redundant if main.py does it, but safe)
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "profiles").mkdir(exist_ok=True)
(UPLOAD_DIR / "originals").mkdir(exist_ok=True)
(UPLOAD_DIR / "results").mkdir(exist_ok=True)

@router.post("/upload/profile-photo")
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

@router.post("/upload/result-photo")
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

@router.post("/upload/original-photo")
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

@router.get("/images/{image_type}/{filename}")
async def get_image(image_type: str, filename: str):
    # Handle style images from assets directory
    if image_type == "styles":
        file_path = Path("assets") / "styles" / filename
    else:
        file_path = UPLOAD_DIR / image_type / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)
