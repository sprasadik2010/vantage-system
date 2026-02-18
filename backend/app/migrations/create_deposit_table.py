"""
Script to create deposit_transactions table
Run this script to add the deposit functionality to your database
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum
import os
from dotenv import load_dotenv

load_dotenv()

# Import your existing Base or create a new one
# If running standalone, uncomment the database connection below
"""
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_SERVER')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"
engine = create_engine(DATABASE_URL)
Base = declarative_base()
"""

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
    usdt_address = Column(String(255), nullable=False)  # Superadmin's USDT address
    transaction_hash = Column(String(255), nullable=True, unique=True)  # User's transaction hash
    payment_screenshot = Column(String(500), nullable=True)  # Path to uploaded screenshot
    
    # Additional info
    notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationship (add this to your existing User model)
    # user = relationship("User", back_populates="deposits")

def create_deposit_table():
    """Run this function to create the table"""
    print("Creating deposit_transactions table...")
    Base.metadata.create_all(bind=engine)
    print("Table created successfully!")

def drop_deposit_table():
    """Run this function to drop the table (if needed)"""
    print("Dropping deposit_transactions table...")
    Base.metadata.drop_all(bind=engine, tables=[DepositTransaction.__table__])
    print("Table dropped successfully!")

if __name__ == "__main__":
    # When run directly, create the table
    create_deposit_table()