from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any

from .. import crud, schemas, models, utils
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=schemas.user.UserResponse)
def register(
    user_data: schemas.user.UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if user exists
    if crud.user.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate username (YYMMDD + 4 random digits)
    import random
    from datetime import datetime
    date_part = datetime.now().strftime("%y%m%d")
    random_part = str(random.randint(1000, 9999))
    username = date_part + random_part
    
    # Check if referral code is valid
    parent_id = None
    if user_data.referral_code:
        parent = crud.user.get_user_by_referral_code(db, user_data.referral_code)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid referral code"
            )
        parent_id = parent.id
    
    # Generate referral code for new user
    import string
    referral_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    # Create user
    user_dict = user_data.dict()
    user_dict["username"] = username
    user_dict["referral_code"] = referral_code
    user_dict["parent_id"] = parent_id
    
    user = crud.user.create_user(db, user_dict)
    
    return user

# FIXED: Changed OAuth2PasswordRequestForm to regular form data
@router.post("/login")
def login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    """User login"""
    user = crud.user.authenticate_user(
        db, 
        username=username,
        password=password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.security.create_access_token(
        data={"sub": user.username, "role": "admin" if user.is_admin else "user"},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.user.UserResponse.from_orm(user)
    }

@router.get("/me", response_model=schemas.user.UserResponse)
def get_current_user(
    current_user: models.User = Depends(utils.security.get_current_user)
):
    """Get current user info"""
    return current_user