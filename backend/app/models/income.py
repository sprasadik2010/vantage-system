from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum

class IncomeType(str, enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"

class Income(Base):
    __tablename__ = "incomes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    level = Column(Integer, nullable=False)
    income_type = Column(Enum(IncomeType), nullable=False)
    description = Column(String(200), nullable=True)
    
    # Source user who generated this income
    source_vantage_username = Column(String(50), nullable=False)
    source_income_amount = Column(Float, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="incomes")