from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExcelUploadBase(BaseModel):
    filename: str


class ExcelUploadCreate(ExcelUploadBase):
    file_path: Optional[str] = 'in_memory_processing'
    uploaded_by: int


class ExcelUploadResponse(ExcelUploadBase):
    id: int
    uploaded_by: int
    file_path: Optional[str] = 'in_memory_processing'
    is_processed: bool
    total_rows: int
    processed_rows: int
    error_rows: int
    total_distributed: float
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True