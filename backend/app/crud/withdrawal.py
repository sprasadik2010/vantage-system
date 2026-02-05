from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from .. import models, schemas
from datetime import datetime

def create_withdrawal(db: Session, withdrawal_data: schemas.WithdrawalCreate, user_id: int) -> models.WithdrawalRequest:
    db_withdrawal = models.WithdrawalRequest(
        **withdrawal_data.dict(),
        user_id=user_id
    )
    db.add(db_withdrawal)
    db.commit()
    db.refresh(db_withdrawal)
    return db_withdrawal

def get_withdrawal(db: Session, withdrawal_id: int) -> Optional[models.WithdrawalRequest]:
    return db.query(models.WithdrawalRequest).filter(models.WithdrawalRequest.id == withdrawal_id).first()

def get_user_withdrawals(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 0,
    status: Optional[str] = None
) -> List[models.WithdrawalRequest]:
    query = db.query(models.WithdrawalRequest).filter(models.WithdrawalRequest.user_id == user_id)
    
    if status:
        query = query.filter(models.WithdrawalRequest.status == status)
    
    return query.order_by(models.WithdrawalRequest.requested_at.desc()).offset(skip).limit(limit).all()

def get_all_withdrawals(
    db: Session, 
    skip: int = 0, 
    limit: int = 0,
    status: Optional[str] = None
) -> List[models.WithdrawalRequest]:
    query = db.query(models.WithdrawalRequest).options(
        joinedload(models.WithdrawalRequest.user)
    )
    if status:
        query = query.filter(models.WithdrawalRequest.status == status)
    
    return query.order_by(models.WithdrawalRequest.requested_at.desc()).offset(skip).limit(limit).all()

def process_withdrawal(
    db: Session, 
    withdrawal_id: int, 
    update_data: schemas.WithdrawalUpdate, 
    admin_id: int
) -> Optional[models.WithdrawalRequest]:
    withdrawal = get_withdrawal(db, withdrawal_id)
    if not withdrawal:
        return None
    
    withdrawal.status = update_data.status
    withdrawal.admin_notes = update_data.admin_notes
    withdrawal.processed_by = admin_id
    withdrawal.processed_at = datetime.now()
    
    # If rejected, return money to user's wallet
    if update_data.status == "REJECTED":
        user = withdrawal.user
        user.wallet_balance += withdrawal.amount
    
    # If approved and completed, update total withdrawn
    elif update_data.status == "COMPLETED":
        user = withdrawal.user
        user.total_withdrawn += withdrawal.amount
    
    db.commit()
    db.refresh(withdrawal)
    return withdrawal