import os
import shutil
import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request

import models, schemas, auth_utils as auth
from dependencies import limiter
from services import style_service

router = APIRouter()

@router.get("/")
async def get_styles(current_user: models.User = Depends(auth.get_current_user)):
    """Get list of available hairstyles"""
    try:
        styles = []
        for style_id, image_path in style_service.STYLE_IMAGES.items():
            metadata = style_service.STYLE_METADATA.get(style_id, {})
            style_info = {
                "id": style_id,
                "name": metadata.get("name") or style_id.replace("_", " ").title(),
                "image_path": image_path.replace("assets/", ""),
                "exists": os.path.exists(image_path),
                "tags": metadata.get("tags", []),
                "gender": metadata.get("gender", "neutral"),
                "category": metadata.get("category", "unknown")
            }
            styles.append(style_info)

        return {"styles": styles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
@limiter.limit("10/hour")  # 10 uploads per hour
async def upload_style(
    request: Request,
    file: UploadFile = File(...),
    style_id: str = Form(None),
    name: str = Form(None),
    tags: str = Form("[]"),  # JSON string of tags
    gender: str = Form("neutral"),
    category: str = Form("unknown"),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Upload a new hairstyle reference image"""
    try:
        # Auto-generate style_id if not provided
        if not style_id:
            # Find the next available style number
            existing_numbers = []
            for existing_id in style_service.STYLE_IMAGES.keys():
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
        if style_id in style_service.STYLE_IMAGES:
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
        style_service.STYLE_IMAGES[style_id] = file_path
        
        # Parse tags
        try:
            tags_list = json.loads(tags)
        except:
            tags_list = []

        # Update Metadata
        style_service.STYLE_METADATA[style_id] = {
            "name": name,
            "tags": tags_list,
            "gender": gender,
            "category": category
        }
        style_service.save_style_metadata()

        return {
            "message": "Style uploaded successfully",
            "style_id": style_id,
            "file_path": file_path
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{style_id}")
async def update_style_metadata(
    style_id: str,
    metadata: schemas.StyleUpdate = None,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update style metadata (tags, gender, etc)"""
    try:
        if style_id not in style_service.STYLE_IMAGES:
            raise HTTPException(status_code=404, detail="Style not found")
            
        if not metadata:
             raise HTTPException(status_code=400, detail="No metadata provided")

        current_meta = style_service.STYLE_METADATA.get(style_id, {})
        
        if metadata.name is not None:
            current_meta["name"] = metadata.name
        if metadata.tags is not None:
            current_meta["tags"] = metadata.tags
        if metadata.gender is not None:
            current_meta["gender"] = metadata.gender
        if metadata.category is not None:
            current_meta["category"] = metadata.category
            
        style_service.STYLE_METADATA[style_id] = current_meta
        style_service.save_style_metadata()
        
        return {"message": "Style updated successfully", "style": current_meta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{style_id}")
async def delete_style(
    style_id: str,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Delete a hairstyle reference image"""
    try:
        if style_id not in style_service.STYLE_IMAGES:
            raise HTTPException(status_code=404, detail="Style not found")

        file_path = style_service.STYLE_IMAGES[style_id]

        # Delete file if exists
        if os.path.exists(file_path):
            os.remove(file_path)

        # Remove from mapping
        del style_service.STYLE_IMAGES[style_id]
        
        # Remove from metadata
        if style_id in style_service.STYLE_METADATA:
            del style_service.STYLE_METADATA[style_id]
            style_service.save_style_metadata()

        return {"message": "Style deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
