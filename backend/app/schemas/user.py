from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime

# Solution: Keep username in UserBase but make it Optional
class UserBase(BaseModel):
    username: Optional[str] = None  # CHANGED: from str to Optional[str]
    email: EmailStr
    phone: str
    country: str
    full_name: str
    vantage_username: Optional[str] = None
    vantage_password: Optional[str] = None
    is_admin: bool = False
    is_superadmin: bool = False

# UserCreate inherits from UserBase with optional username
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
    vantage_password: Optional[str] = None
    withdrawal_address: Optional[str] = None
    withdrawal_qr_code: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# UserResponse MUST have username (not optional for responses)
class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    is_superadmin: bool
    wallet_balance: float
    total_earned: float
    total_withdrawn: float
    referral_code: str
    withdrawal_address: Optional[str] = None
    withdrawal_qr_code: Optional[str] = None
    parent_id: Optional[int] = None
    created_at: datetime
    
    # Override username to make it required for responses
    username: str  # This overrides the optional username from UserBase
    
    class Config:
        from_attributes = True

class TokenData(Token):
    user: UserResponse

class UserWithChildren(UserResponse):
    children: List[UserResponse] = []

class UserPasswordUpdate(BaseModel):
    new_password: str