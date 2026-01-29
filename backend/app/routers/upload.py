from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import asyncio
from datetime import datetime

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
    
    try:
        # Read file content
        print(f"Reading file: {file.filename}")
        contents = await file.read()
        print(f"File size: {len(contents)} bytes")
        
        # Create upload record
        upload_data = {
            "filename": file.filename,
            "file_path": None,
            "uploaded_by": current_user.id
        }
        
        print(f"Creating upload record for user: {current_user.id}")
        upload = crud.upload.create_upload(db, upload_data)
        print(f"Created upload record ID: {upload.id}")
        
        # Process file IMMEDIATELY (synchronous, waits for completion)
        print("Starting Excel processing...")
        result = ExcelProcessor.process_excel_sync(
            db=db,
            file_data=contents,
            uploaded_by=current_user.id,
            upload_id=upload.id
        )
        print(f"Processing result: {result}")
        
        # Refresh to get updated data
        db.refresh(upload)
        print(f"Final upload data: is_processed={upload.is_processed}, total_rows={upload.total_rows}")
        
        return upload
        
    except Exception as e:
        print(f"ERROR in upload_excel endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

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