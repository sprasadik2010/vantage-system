from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum

class DepositStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMING = "CONFIRMING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"

class DepositTransaction(Base):
    __tablename__ = "deposit_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Transaction details
    amount = Column(Float, nullable=False)
    status = Column(Enum(DepositStatus), default=DepositStatus.PENDING)
    
    # Payment details
    usdt_address = Column(String(255), nullable=False)
    transaction_hash = Column(String(255), nullable=True, unique=True)
    payment_screenshot = Column(String(500), nullable=True)
    
    # Additional info
    notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="deposits")