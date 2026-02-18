from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from typing import List, Optional
from .. import crud, models, schemas
from datetime import datetime

def create_deposit(
    db: Session, 
    deposit_data: schemas.DepositCreate, 
    user_id: int
) -> models.DepositTransaction:
    """Create a new deposit request"""
    db_deposit = models.DepositTransaction(
        **deposit_data.dict(),
        user_id=user_id,
        status="PENDING"
    )
    db.add(db_deposit)
    db.commit()
    db.refresh(db_deposit)
    return db_deposit

def get_deposit(
    db: Session, 
    deposit_id: int
) -> Optional[models.DepositTransaction]:
    """Get deposit by ID"""
    return db.query(models.DepositTransaction)\
        .filter(models.DepositTransaction.id == deposit_id)\
        .first()

def get_user_deposits(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[models.DepositTransaction]:
    """Get deposits for a specific user"""
    query = db.query(models.DepositTransaction)\
        .filter(models.DepositTransaction.user_id == user_id)
    
    if status:
        query = query.filter(models.DepositTransaction.status == status)
    
    return query.order_by(desc(models.DepositTransaction.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_all_deposits(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[models.DepositTransaction]:
    """Get all deposits (admin only)"""
    query = db.query(models.DepositTransaction)\
        .options(joinedload(models.DepositTransaction.user))
    
    if status:
        query = query.filter(models.DepositTransaction.status == status)
    
    return query.order_by(desc(models.DepositTransaction.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()

def update_deposit_screenshot(
    db: Session,
    deposit_id: int,
    screenshot_path: str,
    transaction_hash: Optional[str] = None
) -> Optional[models.DepositTransaction]:
    """Update deposit with screenshot after payment"""
    deposit = get_deposit(db, deposit_id)
    if deposit:
        deposit.payment_screenshot = screenshot_path
        if transaction_hash:
            deposit.transaction_hash = transaction_hash
        deposit.status = "CONFIRMING"
        deposit.updated_at = datetime.now()
        db.commit()
        db.refresh(deposit)
    return deposit

def process_deposit(
    db: Session,
    deposit_id: int,
    update_data: schemas.DepositUpdate,
    admin_id: int
) -> Optional[models.DepositTransaction]:
    """Process deposit (admin only)"""
    deposit = get_deposit(db, deposit_id)
    if not deposit:
        return None
    
    # Update deposit status
    deposit.status = update_data.status
    if update_data.transaction_hash:
        deposit.transaction_hash = update_data.transaction_hash
    if update_data.admin_notes:
        deposit.admin_notes = update_data.admin_notes
    
    # If completed, update user's wallet
    if update_data.status == "COMPLETED":
        user = deposit.user
        user.wallet_balance += deposit.amount
        user.total_earned += deposit.amount  # Track total deposits
        deposit.confirmed_at = datetime.now()
    
    deposit.updated_at = datetime.now()
    db.commit()
    db.refresh(deposit)
    return deposit

def get_user_deposit_summary(db: Session, user_id: int) -> dict:
    """Get deposit summary for a user"""
    # Total deposits (completed only)
    total_deposited = db.query(func.sum(models.DepositTransaction.amount))\
        .filter(
            models.DepositTransaction.user_id == user_id,
            models.DepositTransaction.status == "COMPLETED"
        ).scalar() or 0.0
    
    # Pending deposits
    pending_amount = db.query(func.sum(models.DepositTransaction.amount))\
        .filter(
            models.DepositTransaction.user_id == user_id,
            models.DepositTransaction.status.in_(["PENDING", "CONFIRMING"])
        ).scalar() or 0.0
    
    # Count by status
    status_counts = {}
    for status in ["PENDING", "CONFIRMING", "COMPLETED", "FAILED", "EXPIRED"]:
        count = db.query(models.DepositTransaction)\
            .filter(
                models.DepositTransaction.user_id == user_id,
                models.DepositTransaction.status == status
            ).count()
        status_counts[status] = count
    
    return {
        "total_deposited": total_deposited,
        "pending_amount": pending_amount,
        "status_counts": status_counts,
        "total_transactions": sum(status_counts.values())
    }