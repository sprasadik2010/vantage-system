from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from .. import models, schemas
from datetime import datetime

def create_deduction(
    db: Session,
    user_id: int,
    amount: float,
    deduction_type: str,
    description: Optional[str] = None,
    related_deposit_id: Optional[int] = None,
    related_income_id: Optional[int] = None,
    admin_notes: Optional[str] = None,
    deducted_by: Optional[int] = None
) -> models.Deduction:
    """Create a new deduction record"""
    db_deduction = models.Deduction(
        user_id=user_id,
        amount=amount,
        deduction_type=deduction_type,
        description=description,
        related_deposit_id=related_deposit_id,
        related_income_id=related_income_id,
        admin_notes=admin_notes,
        deducted_by=deducted_by
    )
    db.add(db_deduction)
    db.commit()
    db.refresh(db_deduction)
    return db_deduction

def get_deduction(
    db: Session,
    deduction_id: int
) -> Optional[models.Deduction]:
    """Get a specific deduction by ID"""
    return db.query(models.Deduction)\
        .filter(models.Deduction.id == deduction_id)\
        .first()

def get_user_deductions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[models.Deduction]:
    """Get all deductions for a user"""
    return db.query(models.Deduction)\
        .filter(models.Deduction.user_id == user_id)\
        .order_by(desc(models.Deduction.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_deductions_by_deposit(
    db: Session,
    deposit_id: int
) -> List[models.Deduction]:
    """Get deductions related to a specific deposit"""
    return db.query(models.Deduction)\
        .filter(models.Deduction.related_deposit_id == deposit_id)\
        .order_by(desc(models.Deduction.created_at))\
        .all()

def get_total_deductions(
    db: Session,
    user_id: int
) -> float:
    """Get total amount deducted for a user"""
    from sqlalchemy import func
    total = db.query(func.sum(models.Deduction.amount))\
        .filter(models.Deduction.user_id == user_id)\
        .scalar()
    return total or 0.0
