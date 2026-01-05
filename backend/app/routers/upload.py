from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
import os
import shutil
from typing import List

from .. import crud, schemas, models, utils
from ..schemas.upload import ExcelUploadResponse, ExcelUploadCreate
from ..database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

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

@router.get("/excel", response_model=List[ExcelUploadResponse])
def get_excel_uploads(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Get all Excel uploads (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return crud.upload.get_uploads(db, skip=skip, limit=limit)