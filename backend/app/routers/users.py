# routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

# Import directly
from ..schemas.user import UserResponse, UserUpdate, UserPasswordUpdate
from ..models.user import User
from .. import crud
from ..database import get_db
from ..config import settings
from sqlalchemy import or_

router = APIRouter(prefix="/users", tags=["users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Copy get_current_user function here
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

# ==================== SEARCH ENDPOINT MUST BE FIRST ====================
@router.get("/search")
async def search_users(
    q: str = "",
    skip: int = 0,
    limit: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search users by full name or vantage username"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Build query based on available fields
    query_filters = []
    
    # Try searching by full_name field
    try:
        query_filters.append(User.full_name.ilike(f"%{q}%"))
    except AttributeError:
        # If full_name doesn't exist, maybe you have first_name and last_name separately
        try:
            query_filters.append(User.first_name.ilike(f"%{q}%"))
            query_filters.append(User.last_name.ilike(f"%{q}%"))
        except AttributeError:
            pass
    
    # Always search by vantage_username
    query_filters.append(User.vantage_username.ilike(f"%{q}%"))
    
    # Also search by username and email
    query_filters.append(User.username.ilike(f"%{q}%"))
    query_filters.append(User.email.ilike(f"%{q}%"))
    
    # Apply OR condition to all filters
    users = db.query(User).filter(
        or_(*query_filters)
    ).offset(skip).limit(limit).all()
    
    # Return user data with full_name and vantage_username
    results = []
    for user in users:
        # Try to get full_name from the model
        full_name = getattr(user, 'full_name', None)
        if not full_name:
            # Try to construct from first_name and last_name
            first_name = getattr(user, 'first_name', '')
            last_name = getattr(user, 'last_name', '')
            full_name = f"{first_name} {last_name}".strip()
            if not full_name:
                full_name = user.username  # Fallback to username
        
        results.append({
            "id": user.id,
            "full_name": full_name,
            "vantage_username": user.vantage_username or "",
            "username": user.username,
            "email": user.email
        })
    
    return results

# ==================== OTHER ROUTES COME AFTER ====================
@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 0,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users (admin only)"""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return crud.user.get_users(db, skip=skip, limit=limit, is_active=is_active)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    if current_user.id != user_id and not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = crud.user.update_user(db, user_id, user_data.dict(exclude_unset=True))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/{user_id}/toggle_user_active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate a user (admin/superadmin only)"""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = crud.user.toggle_user_active(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User activated successfully", "user": user}

@router.get("/{user_id}/referrals", response_model=List[UserResponse])
def get_user_referrals(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    referrals = db.query(User).filter(User.parent_id == user_id).all()
    return referrals

@router.put("/{user_id}/password", response_model=UserResponse)
def update_user_password(
    user_id: int,
    password_data: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user password"""
    if current_user.id != user_id and not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get user - FIX: use get_user instead of get
    user = crud.user.get_user(db, user_id)  # CHANGED FROM get TO get_user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password (make sure to hash it in your crud/user.py)
    updated_user = crud.user.update_password(
        db, 
        user_id, 
        password_data.new_password
    )
    
    return updated_user