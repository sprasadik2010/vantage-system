from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.deposit import DepositStatus

# Base schema
class DepositBase(BaseModel):
    amount: float
    usdt_address: str

# Create deposit request
class DepositCreate(DepositBase):
    pass

# Update deposit (for admin)
class DepositUpdate(BaseModel):
    status: DepositStatus
    transaction_hash: Optional[str] = None
    admin_notes: Optional[str] = None

# Upload screenshot
class DepositScreenshotUpload(BaseModel):
    transaction_id: int
    screenshot_path: str
    transaction_hash: Optional[str] = None

# Response schema
class DepositResponse(DepositBase):
    id: int
    user_id: int
    status: DepositStatus
    transaction_hash: Optional[str] = None
    payment_screenshot: Optional[str] = None
    notes: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Deposit with user details (for admin)
class DepositWithUserResponse(DepositResponse):
    user: dict  # Will contain user details
    
    class Config:
        from_attributes = True