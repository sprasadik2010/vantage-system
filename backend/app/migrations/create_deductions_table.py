"""Create deductions table migration"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum
from ..database import Base, engine

class DeductionType(str, enum.Enum):
    DEPOSIT_PAYMENT = "DEPOSIT_PAYMENT"
    WITHDRAWAL = "WITHDRAWAL"  
    MANUAL = "MANUAL"

def upgrade():
    """Create deductions table"""
    Base.metadata.create_all(bind=engine)
    print("Deductions table created successfully")

if __name__ == "__main__":
    upgrade()
