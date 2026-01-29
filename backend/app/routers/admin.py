from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from .. import crud, schemas, models, utils
from ..database import get_db
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from ..models.user import User
from ..config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(prefix="/admin", tags=["admin"])


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

@router.get("/reports/users")
def get_user_report(
    start_date: datetime = None,
    end_date: datetime = None,   
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate user report (superadmin only)"""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Default to last 30 days
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    # Get users created in date range
    users = db.query(models.User).filter(
        models.User.created_at >= start_date,
        models.User.created_at <= end_date
    ).all()
    
    # Get statistics
    total_users = len(users)
    active_users = len([u for u in users if u.is_active])
    total_income = sum(user.total_earned for user in users)
    total_withdrawals = sum(user.total_withdrawn for user in users)
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "statistics": {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "total_income": total_income,
            "total_withdrawals": total_withdrawals,
            "platform_balance": total_income - total_withdrawals
        },
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "total_earned": user.total_earned,
                "total_withdrawn": user.total_withdrawn,
                "created_at": user.created_at
            }
            for user in users
        ]
    }

@router.get("/reports/income")
def get_income_report(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db),
):
    """Generate income distribution report (admin only)"""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Default to last 30 days
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    
    # Get incomes in date range
    incomes = db.query(models.Income).filter(
        models.Income.created_at >= start_date,
        models.Income.created_at <= end_date
    ).all()
    
    # Group by income type and level
    report = {}
    total_amount = 0
    
    for income in incomes:
        key = f"{income.income_type}_level_{income.level}"
        if key not in report:
            report[key] = {
                "income_type": income.income_type,
                "level": income.level,
                "count": 0,
                "total_amount": 0,
                "percentage": income.percentage
            }
        
        report[key]["count"] += 1
        report[key]["total_amount"] += income.amount
        total_amount += income.amount
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "total_amount": total_amount,
        "distribution": list(report.values())
    }