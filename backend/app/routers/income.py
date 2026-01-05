from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from .. import crud, schemas, models, utils
from ..database import get_db

router = APIRouter(prefix="/income", tags=["income"])

@router.get("/my-income", response_model=List[schemas.income.IncomeResponse])
def get_my_income(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    income_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.security.get_current_user)
):
    """Get current user's income records"""
    return crud.income.get_user_incomes(
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
    period: str = Query("daily", regex="^(daily|weekly|monthly|all)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.security.get_current_user)
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