from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

import enum


class WithdrawalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"

class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(WithdrawalStatus), default=WithdrawalStatus.PENDING)
    
    # Admin processing
    processed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_notes = Column(String(500), nullable=True)
    
    # Timestamps
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    
    # Relationships
    user = relationship("User", back_populates="withdrawal_requests", foreign_keys=[user_id])
    admin = relationship("User", foreign_keys=[processed_by])