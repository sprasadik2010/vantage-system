from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum

class DeductionType(str, enum.Enum):
    DEPOSIT_PAYMENT = "DEPOSIT_PAYMENT"  # 50% deduction when a payment is made
    WITHDRAWAL = "WITHDRAWAL"  # For future use
    MANUAL = "MANUAL"  # For admin-initiated deductions

class Deduction(Base):
    """Track deductions from user deposits and wallet"""
    __tablename__ = "deductions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Deduction details
    amount = Column(Float, nullable=False)
    deduction_type = Column(Enum(DeductionType), default=DeductionType.DEPOSIT_PAYMENT)
    description = Column(Text, nullable=True)
    
    # Related transaction (e.g., deposit ID that triggered this deduction)
    related_deposit_id = Column(Integer, ForeignKey("deposit_transactions.id"), nullable=True)
    related_income_id = Column(Integer, ForeignKey("incomes.id"), nullable=True)
    
    # Admin notes
    admin_notes = Column(Text, nullable=True)
    deducted_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who made the deduction
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="deductions", foreign_keys=[user_id])
    deducted_by_user = relationship("User", foreign_keys=[deducted_by])
    deposit = relationship("DepositTransaction", backref="deductions")
