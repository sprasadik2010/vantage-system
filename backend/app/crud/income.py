from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from datetime import datetime, date

def create_income(db: Session, income_data: dict) -> models.Income:
    db_income = models.Income(**income_data)
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

def get_user_incomes(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 0,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    income_type: Optional[str] = None
) -> List[models.Income]:
    query = db.query(models.Income).filter(models.Income.user_id == user_id)
    
    if start_date:
        query = query.filter(models.Income.created_at >= start_date)
    if end_date:
        query = query.filter(models.Income.created_at <= end_date)
    if income_type:
        query = query.filter(models.Income.income_type == income_type)
    
    return query.order_by(models.Income.created_at.desc()).offset(skip).limit(limit).all()

def get_total_income_by_period(
    db: Session, 
    user_id: int,
    period: str = "DAILY"
) -> float:
    from sqlalchemy import func
    
    if period == "DAILY":
        date_filter = func.date(models.Income.created_at) == date.today()
    elif period == "WEEKLY":
        # Last 7 days
        date_filter = models.Income.created_at >= datetime.now().date()
    elif period == "MONTHLY":
        # Current month
        today = date.today()
        date_filter = func.extract('month', models.Income.created_at) == today.month
        date_filter &= func.extract('year', models.Income.created_at) == today.year
    else:
        return 0.0
    
    result = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == user_id,
        date_filter
    ).scalar()
    
    return result or 0.0