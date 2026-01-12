from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class ExcelUpload(Base):
    __tablename__ = "excel_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Processing status
    is_processed = Column(Boolean, default=False)
    total_rows = Column(Integer, default=0)
    processed_rows = Column(Integer, default=0)
    error_rows = Column(Integer, default=0)
    
    # Income distribution
    total_distributed = Column(Float, default=0.0)
    
    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    uploader = relationship("User")