from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from .. import crud, schemas, models, utils
from app.crud.income import get_user_incomes
from ..schemas.income import IncomeResponse
from ..database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from ..models.user import User
from ..config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(prefix="/income", tags=["income"])


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

@router.get("/my-income", response_model=List[IncomeResponse])
def get_my_income(
    skip: int = 0,
    limit: int = 0,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    income_type: Optional[str] = None,    
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's income records"""
    return get_user_incomes(
        db, 
        current_user.id, 
        skip=skip, 
        limit=limit,
        start_date=start_date,
        end_date=end_date,
        income_type=income_type
    )

@router.get("/summary")
def get_income_summary(
    period: str = Query("DAILY", regex="^(DAILY|WEEKLY|MONTHLY|all)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get income summary for different periods"""
    if period == "all":
        total = current_user.total_earned
    else:
        total = crud.income.get_total_income_by_period(db, current_user.id, period)
    
    return {
        "period": period,
        "total_amount": total,
        "wallet_balance": current_user.wallet_balance,
        "total_withdrawn": current_user.total_withdrawn
    }