from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas

def create_upload(db: Session, upload_data: dict) -> models.ExcelUpload:
    db_upload = models.ExcelUpload(**upload_data)
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)
    return db_upload

def get_upload(db: Session, upload_id: int) -> models.ExcelUpload:
    return db.query(models.ExcelUpload).filter(models.ExcelUpload.id == upload_id).first()

def get_uploads(db: Session, skip: int = 0, limit: int = 100) -> List[models.ExcelUpload]:
    return db.query(models.ExcelUpload).order_by(models.ExcelUpload.uploaded_at.desc()).offset(skip).limit(limit).all()