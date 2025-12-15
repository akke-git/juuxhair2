from fastapi import APIRouter, Depends
import models, schemas, auth_utils as auth

router = APIRouter()

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
