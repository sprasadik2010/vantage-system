from sqlalchemy.orm import Session
from typing import Optional, List
from .. import models, schemas
from ..utils.security import get_password_hash
import random
import string

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_phone(db: Session, phone: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.phone == phone).first()

def get_user_by_vantage_username(db: Session, vantage_username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.vantage_username == vantage_username).first()

def get_user_by_referral_code(db: Session, referral_code: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.referral_code == referral_code).first()

def get_users(db: Session, skip: int = 0, limit: int = 0, is_active: Optional[bool] = None) -> List[models.User]:
    query = db.query(models.User)
    if is_active is not None:
        query = query.filter(models.User.is_active == is_active)
    return query.order_by(models.User.id).offset(skip).limit(limit).all()

def create_user(db: Session, user_data: dict) -> models.User:
    # Hash password
    hashed_password = get_password_hash(user_data.pop("password"))
    
    # Create user
    db_user = models.User(
        **user_data,
        password_hash=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    user = get_user_by_username(db, username)
    if not user:
        return None
    from ..utils.security import verify_password
    if not verify_password(password, user.password_hash):
        return None
    return user

def update_user(db: Session, user_id: int, user_data: dict) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in user_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def toggle_user_active(db: Session, user_id: int) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        db_user.is_active = not db_user.is_active
        db.commit()
        db.refresh(db_user)
    return db_user

def get_direct_referrals_count(db: Session, user_id: int) -> int:
    return db.query(models.User).filter(models.User.parent_id == user_id).count()

def get_referral_tree(db: Session, user_id: int, level: int = 1, max_level: int = 5) -> List[dict]:
    if level > max_level:
        return []
    
    children = db.query(models.User).filter(models.User.parent_id == user_id).all()
    result = []
    
    for child in children:
        child_data = {
            "id": child.id,
            "username": child.username,
            "email": child.email,
            "level": level,
            "children": get_referral_tree(db, child.id, level + 1, max_level)
        }
        result.append(child_data)
    
    return result

def update_password(db: Session, user_id: int, new_password: str):
    db_user = get_user(db, user_id)  # Use your existing get_user function
    if db_user:
        # Hash the password before storing
        hashed_password = get_password_hash(new_password)
        db_user.password_hash = hashed_password  # FIXED: was hashed_password, should be password_hash
        db.commit()
        db.refresh(db_user)
    return db_user