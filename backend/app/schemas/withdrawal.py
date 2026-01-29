from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.withdrawal import WithdrawalStatus
from .user import UserResponse

class WithdrawalBase(BaseModel):
    amount: float

class WithdrawalCreate(WithdrawalBase):
    pass

class WithdrawalUpdate(BaseModel):
    status: WithdrawalStatus
    admin_notes: Optional[str] = None

class WithdrawalResponse(WithdrawalBase):
    id: int
    user_id: int
    status: WithdrawalStatus
    admin_notes: Optional[str] = None
    requested_at: datetime
    processed_at: Optional[datetime] = None
    processed_by: Optional[int] = None
    user: UserResponse
    
    class Config:
        from_attributes = True