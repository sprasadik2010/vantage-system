from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    phone: str
    country: str
    full_name: str
    vantage_username: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(min_length=8, description="Password must be at least 8 characters")
    referral_code: Optional[str] = None  # For registration via referral link
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserUpdate(BaseModel):
    phone: Optional[str] = None
    country: Optional[str] = None
    full_name: Optional[str] = None
    vantage_username: Optional[str] = None
    withdrawal_address: Optional[str] = None
    withdrawal_qr_code: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    username: str
    is_active: bool
    is_admin: bool
    is_superadmin: bool
    wallet_balance: float
    total_earned: float
    total_withdrawn: float
    referral_code: str
    parent_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserWithChildren(UserResponse):
    children: List['UserResponse'] = []