from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from .. import schemas, models
from ..crud import deposit as deposit_crud  # Import deposit module
from ..database import get_db
from ..middleware.auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/deposit", tags=["deposit"])

# Superadmin's USDT wallet details (store in environment variables)
SUPERADMIN_USDT_ADDRESS = os.getenv("USDT_ADDRESS", "TXYZ1234567890abcdefghijklmnopqrstuvwxyz")
SUPERADMIN_USDT_QR_CODE = os.getenv("USDT_QR_CODE", "/static/qrcodes/usdt_qr.png")

@router.post("/create", response_model=schemas.deposit.DepositResponse)
async def create_deposit_request(
    deposit_data: schemas.deposit.DepositCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new deposit request"""
    # Validate minimum deposit amount (you can set this in settings)
    MIN_DEPOSIT = 10.0  # $10 minimum
    if deposit_data.amount < MIN_DEPOSIT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum deposit amount is ${MIN_DEPOSIT}"
        )
    
    # Create deposit
    deposit = deposit_crud.create_deposit(db, deposit_data, current_user.id)
    return deposit

@router.post("/upload-screenshot/{deposit_id}")
async def upload_payment_screenshot(
    deposit_id: int,
    file: UploadFile = File(...),
    transaction_hash: Optional[str] = Form(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload payment screenshot for a deposit"""
    # Verify deposit exists and belongs to user
    deposit = deposit_crud.get_deposit(db, deposit_id)
    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit request not found"
        )
    
    if deposit.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this deposit"
        )
    
    # Check file type
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {allowed_extensions}"
        )
    
    # Create upload directory if not exists
    upload_dir = os.path.join(settings.UPLOAD_DIR, "deposits", str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    filename = f"deposit_{deposit_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update deposit with screenshot
    relative_path = f"/static/uploads/deposits/{current_user.id}/{filename}"
    updated_deposit = deposit_crud.update_deposit_screenshot(
        db, deposit_id, relative_path, transaction_hash
    )
    
    return {
        "message": "Screenshot uploaded successfully",
        "deposit": updated_deposit
    }

@router.get("/my-deposits", response_model=List[schemas.deposit.DepositResponse])
async def get_my_deposits(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's deposit history"""
    deposits = deposit_crud.get_user_deposits(
        db, current_user.id, skip=skip, limit=limit, status=status
    )
    return deposits

@router.get("/summary")
async def get_deposit_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get deposit summary for current user"""
    summary = deposit_crud.get_user_deposit_summary(db, current_user.id)
    return summary

@router.get("/payment-details")
async def get_payment_details():
    """Get superadmin's USDT payment details"""
    return {
        "usdt_address": SUPERADMIN_USDT_ADDRESS,
        "usdt_qr_code": SUPERADMIN_USDT_QR_CODE,
        "network": "TRC20",  # or ERC20, BEP20 based on your USDT network
        "min_deposit": 10.0,
        "note": "Send only USDT on TRC20 network to this address"
    }

# Admin endpoints
@router.get("/admin/all", response_model=List[schemas.deposit.DepositWithUserResponse])
async def get_all_deposits(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all deposits (admin only)"""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    deposits = deposit_crud.get_all_deposits(db, skip=skip, limit=limit, status=status)
    
    # Format response with user details
    response = []
    for deposit in deposits:
        deposit_dict = {
            "id": deposit.id,
            "user_id": deposit.user_id,
            "amount": deposit.amount,
            "status": deposit.status,
            "usdt_address": deposit.usdt_address,
            "transaction_hash": deposit.transaction_hash,
            "payment_screenshot": deposit.payment_screenshot,
            "notes": deposit.notes,
            "admin_notes": deposit.admin_notes,
            "created_at": deposit.created_at,
            "updated_at": deposit.updated_at,
            "confirmed_at": deposit.confirmed_at,
            "user": {
                "id": deposit.user.id,
                "username": deposit.user.username,
                "full_name": deposit.user.full_name,
                "email": deposit.user.email
            }
        }
        response.append(deposit_dict)
    
    return response

@router.put("/admin/process/{deposit_id}")
async def process_deposit(
    deposit_id: int,
    update_data: schemas.deposit.DepositUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process deposit (admin only)"""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    deposit = deposit_crud.process_deposit(db, deposit_id, update_data, current_user.id)
    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )
    
    return {"message": f"Deposit {update_data.status} successfully", "deposit": deposit}