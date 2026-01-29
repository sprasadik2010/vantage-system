# app/schemas/manual_distribution.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ManualDistributionBase(BaseModel):
    vantage_username: str
    amount: float
    income_type: str  # DAILY, WEEKLY, MONTHLY


class ManualDistributionCreate(ManualDistributionBase):
    notes: Optional[str] = None
    distribution_type: str = 'MANUAL'


class ManualDistributionResponse(BaseModel):
    success: bool
    message: str
    data: dict