from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeductionBase(BaseModel):
    amount: float
    deduction_type: str
    description: Optional[str] = None
    related_deposit_id: Optional[int] = None
    admin_notes: Optional[str] = None

class DeductionCreate(DeductionBase):
    user_id: int
    deducted_by: Optional[int] = None

class DeductionResponse(DeductionBase):
    id: int
    user_id: int
    created_at: datetime
    deducted_by: Optional[int] = None

    class Config:
        from_attributes = True
