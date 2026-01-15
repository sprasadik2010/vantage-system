from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas, models, utils
from ..schemas.withdrawal import WithdrawalResponse, WithdrawalCreate, WithdrawalUpdate
from ..database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from ..crud.withdrawal import create_withdrawal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
from ..config import settings
from ..models.user import User

router = APIRouter(prefix="/withdrawal", tags=["withdrawal"])


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

@router.post("/request", response_model=WithdrawalResponse)
def create_withdrawal_request(
    withdrawal_data: WithdrawalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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
    withdrawal = create_withdrawal(db, withdrawal_data, current_user.id)
    
    # Deduct from wallet (will be added back if rejected)
    current_user.wallet_balance -= withdrawal_data.amount
    db.commit()
    
    return withdrawal

@router.get("/my-requests", response_model=List[WithdrawalResponse])
def get_my_withdrawal_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's withdrawal requests"""
    return crud.withdrawal.get_user_withdrawals(db, current_user.id, skip=skip, limit=limit, status=status)

@router.get("/all", response_model=List[WithdrawalResponse])
def get_all_withdrawal_requests(
    skip: int = 0,
    limit: int = 100,
    withdrawal_status: Optional[str] = None,   
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all withdrawal requests (admin only)"""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return crud.withdrawal.get_all_withdrawals(db, skip=skip, limit=limit, status=withdrawal_status)

@router.put("/{request_id}/process")
def process_withdrawal_request(
    request_id: int,
    update_data: WithdrawalUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Process withdrawal request (admin only)"""
    if not current_user.is_superadmin:
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