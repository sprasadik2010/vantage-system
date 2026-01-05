from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas, models, utils
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/withdrawal", tags=["withdrawal"])

@router.post("/request", response_model=schemas.withdrawal.WithdrawalResponse)
def create_withdrawal_request(
    withdrawal_data: schemas.withdrawal.WithdrawalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.security.get_current_user)
):
    """Create withdrawal request"""
    # Check minimum withdrawal amount
    if withdrawal_data.amount < settings.MIN_WITHDRAWAL_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum withdrawal amount is ${settings.MIN_WITHDRAWAL_AMOUNT}"
        )
    
    # Check if user has sufficient balance
    if current_user.wallet_balance < withdrawal_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )
    
    # Check if user has withdrawal address
    if not current_user.withdrawal_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please set your withdrawal address first"
        )
    
    # Create withdrawal request
    withdrawal = crud.withdrawal.create_withdrawal(db, withdrawal_data, current_user.id)
    
    # Deduct from wallet (will be added back if rejected)
    current_user.wallet_balance -= withdrawal_data.amount
    db.commit()
    
    return withdrawal

@router.get("/my-requests", response_model=List[schemas.withdrawal.WithdrawalResponse])
def get_my_withdrawal_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.security.get_current_user)
):
    """Get current user's withdrawal requests"""
    return crud.withdrawal.get_user_withdrawals(db, current_user.id, skip=skip, limit=limit, status=status)

@router.get("/all", response_model=List[schemas.withdrawal.WithdrawalResponse])
def get_all_withdrawal_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.security.get_current_user)
):
    """Get all withdrawal requests (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return crud.withdrawal.get_all_withdrawals(db, skip=skip, limit=limit, status=status)

@router.put("/{request_id}/process")
def process_withdrawal_request(
    request_id: int,
    update_data: schemas.withdrawal.WithdrawalUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.security.get_current_user)
):
    """Process withdrawal request (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    withdrawal = crud.withdrawal.process_withdrawal(
        db, 
        request_id, 
        update_data, 
        current_user.id
    )
    
    if not withdrawal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Withdrawal request not found"
        )
    
    return {"message": "Withdrawal request processed", "withdrawal": withdrawal}