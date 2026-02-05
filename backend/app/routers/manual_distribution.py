# app/routers/manual_distribution.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, List
from sqlalchemy import desc

from .. import models
from ..database import get_db
from ..utils.income_calculator import IncomeCalculator
from .auth import get_current_user
from ..schemas.manual_distribution import ManualDistributionCreate

router = APIRouter(prefix="/manual-distribution", tags=["manual-distribution"])


@router.post("/distribute", response_model=Dict)
async def manual_distribute_income(
    distribution_data: ManualDistributionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Distribute income manually to a single user
    """
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        # Validate input
        if not distribution_data.vantage_username or not distribution_data.vantage_username.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vantage username is required"
            )
        
        if distribution_data.amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be positive"
            )
        
        if distribution_data.income_type not in ['DAILY', 'WEEKLY', 'MONTHLY']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Income type must be DAILY, WEEKLY, or MONTHLY"
            )
        
        # Call IncomeCalculator to distribute income with correct parameters
        distribution_result = IncomeCalculator.distribute_income(
            db=db,
            vantage_username=distribution_data.vantage_username.strip(),
            amount=distribution_data.amount,
            income_type=distribution_data.income_type,
            excel_upload_id=None  # No upload ID for manual distribution
            # distributed_by parameter is not accepted
            # distribution_type parameter is not accepted
            # notes parameter is not accepted
        )
        
        if distribution_result.get("errors"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=", ".join(distribution_result["errors"])
            )
        
        # Log notes if provided (for future reference)
        if distribution_data.notes:
            # You might want to log this to a file or database table
            print(f"Note for manual distribution by user {current_user.id} ({current_user.username}): {distribution_data.notes}")
            # Consider creating a DistributionLog table:
            # log_entry = models.DistributionLog(
            #     admin_id=current_user.id,
            #     vantage_username=distribution_data.vantage_username,
            #     amount=distribution_data.amount,
            #     income_type=distribution_data.income_type,
            #     notes=distribution_data.notes,
            #     created_at=datetime.now()
            # )
            # db.add(log_entry)
            # db.commit()
        
        return {
            "success": True,
            "message": "Income distributed successfully",
            "data": {
                "distributed_amount": distribution_result.get("distributed", 0),
                "users_affected": distribution_result.get("users_affected", 0),
                "commission_breakdown": distribution_result.get("commission_breakdown", {}),
                "transaction_id": distribution_result.get("transaction_id"),
                "timestamp": datetime.now().isoformat(),
                "note": distribution_data.notes  # Include note in response
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Distribution failed: {str(e)}"
        )


@router.get("/history")
async def get_manual_distribution_history(
    skip: int = 0,
    limit: int = 0,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get manual distribution history
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Query income history filtered by manual distribution
    # Note: You need to check if IncomeHistory model has distribution_type field
    # If not, you might need to filter by excel_upload_id = None or create a separate field
    try:
        distributions = db.query(models.IncomeHistory).filter(
            models.IncomeHistory.excel_upload_id == None  # Manual distributions have no upload ID
        ).order_by(desc(models.IncomeHistory.created_at)).offset(skip).limit(limit).all()
        
        return distributions
    except Exception as e:
        # If the query fails, return empty list
        print(f"Error fetching manual distribution history: {e}")
        return []