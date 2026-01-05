from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExcelUploadBase(BaseModel):
    filename: str

class ExcelUploadCreate(ExcelUploadBase):
    pass

class ExcelUploadResponse(ExcelUploadBase):
    id: int
    uploaded_by: int
    file_path: str
    is_processed: bool
    total_rows: int
    processed_rows: int
    error_rows: int
    total_distributed: float
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True