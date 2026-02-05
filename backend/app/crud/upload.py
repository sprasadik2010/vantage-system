from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
import datetime


def create_upload(db: Session, upload_data: dict) -> models.ExcelUpload:
    """Create a new Excel upload record"""
    db_upload = models.ExcelUpload(
        filename=upload_data["filename"],
        file_path=upload_data["file_path"],
        uploaded_by=upload_data["uploaded_by"]
    )
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)
    return db_upload


def get_upload(db: Session, upload_id: int) -> Optional[models.ExcelUpload]:
    """Get upload by ID"""
    return db.query(models.ExcelUpload).filter(models.ExcelUpload.id == upload_id).first()


def get_uploads(db: Session, skip: int = 0, limit: int = 0) -> List[models.ExcelUpload]:
    """Get all uploads with pagination"""
    return db.query(models.ExcelUpload).order_by(
        models.ExcelUpload.uploaded_at.desc()
    ).offset(skip).limit(limit).all()


def update_upload_status(
    db: Session,
    upload_id: int,
    total_rows: int = 0,
    processed_rows: int = 0,
    error_rows: int = 0,
    total_distributed: float = 0.0,
    is_processed: bool = True
) -> Optional[models.ExcelUpload]:
    """Update upload processing status"""
    upload = get_upload(db, upload_id)
    if upload:
        upload.total_rows = total_rows
        upload.processed_rows = processed_rows
        upload.error_rows = error_rows
        upload.total_distributed = total_distributed
        upload.is_processed = is_processed
        upload.processed_at = datetime.datetime.now()
        db.commit()
        db.refresh(upload)
    return upload