# routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

# Import directly
from ..schemas.user import UserResponse, UserUpdate, UserPasswordUpdate
from ..models.user import User
from .. import crud
from ..database import get_db
from ..config import settings
from ..middleware.auth import get_current_user_optional, get_current_user  # Import both

router = APIRouter(prefix="/users", tags=["users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# ==================== SEARCH ENDPOINT MUST BE FIRST ====================
@router.get("/search")
async def search_users(
    q: str = "",
    skip: int = 0,
    limit: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Keep as active for search (admin function)
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
            "vantage_password": user.vantage_password or "",
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
    current_user: User = Depends(get_current_user)  # Keep as active (admin only)
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)  # FIXED: Allow inactive to view their own profile
):
    """Get user by ID - users can view their own profile even if inactive"""
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is viewing their own profile or is admin
    if current_user.id != user_id and not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this user"
        )
    
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Keep as active for updates
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
    current_user: User = Depends(get_current_user)  # Keep as active (admin only)
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
    current_user: User = Depends(get_current_user_optional)  # FIXED: Allow inactive to see their referrals
):
    """Get all direct referrals (level 1) for a user - allowed for inactive users"""
    # Check if user is viewing their own referrals or is admin
    if current_user.id != user_id and not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view these referrals"
        )
    
    referrals = db.query(User).filter(User.parent_id == user_id).all()
    return referrals

@router.get("/{user_id}/referrals/level/{level}", response_model=List[UserResponse])
def get_user_referrals_by_level(
    user_id: int,
    level: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)  # FIXED: Allow inactive to see their referrals
):
    """Get referrals for a specific level (1-5) - allowed for inactive users"""
    if level < 1 or level > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Level must be between 1 and 5"
        )
    
    # Check if user is viewing their own referrals or is admin
    if current_user.id != user_id and not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view these referrals"
        )
    
    # Get referrals at a specific level recursively
    def get_referrals_at_level(parent_id: int, target_level: int, current_level: int = 1) -> List[User]:
        if current_level == target_level:
            # Return all users at this level
            return db.query(User).filter(User.parent_id == parent_id).all()
        else:
            # Recursively get referrals from next level
            direct_refs = db.query(User).filter(User.parent_id == parent_id).all()
            all_refs = []
            for ref in direct_refs:
                all_refs.extend(get_referrals_at_level(ref.id, target_level, current_level + 1))
            return all_refs
    
    referrals = get_referrals_at_level(user_id, level)
    return referrals

@router.put("/{user_id}/password", response_model=UserResponse)
def update_user_password(
    user_id: int,
    password_data: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Keep as active for password updates
):
    """Update user password"""
    if current_user.id != user_id and not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Get user
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    updated_user = crud.user.update_password(
        db, 
        user_id, 
        password_data.new_password
    )
    
    return updated_user

# Optional: Add a referral tree endpoint that returns the full tree
@router.get("/{user_id}/referral-tree")
def get_referral_tree(
    user_id: int,
    max_level: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)  # FIXED: Allow inactive
):
    """Get full referral tree for a user - allowed for inactive users"""
    # Check if user is viewing their own tree or is admin
    if current_user.id != user_id and not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this referral tree"
        )
    
    tree = crud.user.get_referral_tree(db, user_id, max_level=max_level)
    return tree

# Optional: Get referral stats
@router.get("/{user_id}/referral-stats")
def get_referral_stats(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)  # FIXED: Allow inactive
):
    """Get referral statistics for a user - allowed for inactive users"""
    # Check if user is viewing their own stats or is admin
    if current_user.id != user_id and not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view these stats"
        )
    
    # Get direct referrals count
    direct_count = crud.user.get_direct_referrals_count(db, user_id)
    
    # Get total referrals across all levels
    tree = crud.user.get_referral_tree(db, user_id, max_level=5)
    
    def count_total_referrals(tree):
        count = len(tree)
        for node in tree:
            count += count_total_referrals(node.get('children', []))
        return count
    
    total_referrals = count_total_referrals(tree)
    
    # Get counts by level
    level_counts = {}
    for level in range(1, 6):
        level_counts[f"level_{level}"] = len(crud.user.get_referral_tree(db, user_id, max_level=level, level=level))
    
    return {
        "user_id": user_id,
        "direct_referrals": direct_count,
        "total_referrals": total_referrals,
        "level_counts": level_counts
    }