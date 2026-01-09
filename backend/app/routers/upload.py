from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import asyncio

from .. import crud, schemas, models
from ..schemas.upload import ExcelUploadResponse, ExcelUploadCreate
from ..database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from ..models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
from ..config import settings
from ..utils.excel_processor import ExcelProcessor

router = APIRouter(prefix="/upload", tags=["upload"])


# Authentication function
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.user.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user


@router.post("/excel", response_model=ExcelUploadResponse)
async def upload_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    import os
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save file to disk (since ExcelProcessor expects file_path)
    import shutil
    import uuid
    from datetime import datetime
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create upload record in database
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


@router.get("/excel", response_model=List[ExcelUploadResponse])
def get_excel_uploads(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all Excel uploads (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return crud.upload.get_uploads(db, skip=skip, limit=limit)


@router.get("/excel/{upload_id}", response_model=ExcelUploadResponse)
def get_excel_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific Excel upload (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    upload = crud.upload.get_upload(db, upload_id)
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload not found"
        )
    
    return upload