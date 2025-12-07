from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    salon_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLogin(BaseModel):
    id_token: Optional[str] = None
    access_token: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenRefresh(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Salon Schemas
class SalonBase(BaseModel):
    name: str

class SalonCreate(SalonBase):
    pass

class SalonResponse(SalonBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Member Schemas
class MemberBase(BaseModel):
    name: str
    phone: str
    memo: Optional[str] = None
    photo_path: Optional[str] = None

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    memo: Optional[str] = None
    photo_path: Optional[str] = None

class MemberResponse(MemberBase):
    id: str
    salon_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# SynthesisHistory Schemas
class SynthesisHistoryBase(BaseModel):
    member_id: Optional[str] = None
    original_photo_path: str
    reference_style_id: str
    result_photo_path: Optional[str] = None

class SynthesisHistoryCreate(SynthesisHistoryBase):
    pass

class SynthesisHistoryResponse(SynthesisHistoryBase):
    id: str
    is_synced: bool
    created_at: datetime

    class Config:
        from_attributes = True
