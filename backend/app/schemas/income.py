from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.income import IncomeType

class IncomeBase(BaseModel):
    amount: float
    percentage: float
    level: int
    income_type: IncomeType
    description: Optional[str] = None
    source_vantage_username: str
    source_income_amount: float

class IncomeCreate(IncomeBase):
    user_id: int

class IncomeResponse(IncomeBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True