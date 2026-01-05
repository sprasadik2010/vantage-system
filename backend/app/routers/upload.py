from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
import os
import shutil
from typing import List

from .. import crud, schemas, models, utils
from ..database import get_db
from ..config import settings
from ..utils.excel_processor import ExcelProcessor

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/excel", response_model=schemas.upload.ExcelUploadResponse)
async def upload_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.security.get_current_user)
):
    """Upload Excel file for income distribution (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Validate file type
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel files are allowed"
        )
    
    # Create upload directory if not exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save file
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create upload record
    upload_data = {
        "filename": file.filename,
        "file_path": file_path,
        "uploaded_by": current_user.id
    }
    
    upload = crud.upload.create_upload(db, upload_data)
    
    # Process Excel file in background (async)
    import threading
    thread = threading.Thread(
        target=ExcelProcessor.process_excel,
        args=(db, file_path, current_user.id, upload.id)
    )
    thread.start()
    
    return upload

@router.get("/excel", response_model=List[schemas.upload.ExcelUploadResponse])
def get_excel_uploads(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.security.get_current_user)
):
    """Get all Excel uploads (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return crud.upload.get_uploads(db, skip=skip, limit=limit)