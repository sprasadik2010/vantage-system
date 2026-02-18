from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    country = Column(String(50), nullable=False)
    full_name = Column(String(100), nullable=False)
    vantage_username = Column(String(50), unique=True, index=True, nullable=True)
    vantage_password = Column(String(50), nullable=True)
    
    # Password
    password_hash = Column(String(255), nullable=False)
    
    # Referral system
    referral_code = Column(String(10), unique=True, index=True, nullable=False)
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    parent = relationship("User", remote_side=[id], backref="children")
    
    # Account status
    is_active = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_superadmin = Column(Boolean, default=False)
    
    # Wallet
    wallet_balance = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)
    total_withdrawn = Column(Float, default=0.0)
    
    # Withdrawal details
    withdrawal_address = Column(Text, nullable=True)
    withdrawal_qr_code = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    incomes = relationship("Income", back_populates="user")
    withdrawal_requests = relationship("WithdrawalRequest", back_populates="user", foreign_keys="[WithdrawalRequest.user_id]")

    # Add this to your User model relationships section
    deposits = relationship("DepositTransaction", back_populates="user", foreign_keys="[DepositTransaction.user_id]")