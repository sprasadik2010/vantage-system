from fastapi import APIRouter, Depends, HTTPException, status, Form, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
import random
import string
from datetime import datetime as dt

# Import User model directly
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse, UserLogin, Token, TokenData
from .. import crud
from ..database import get_db
from ..config import settings
from ..crud.user import get_user_by_username
from ..utils.email_service import EmailService  # Import email service

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")  # Note the leading slash
email_service = EmailService()  # Initialize email service

# Security functions
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    from datetime import datetime
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

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
    
    user = get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Routes
@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,  # Add BackgroundTasks parameter
    db: Session = Depends(get_db)
):
    """Register a new user and send credentials via email"""
    # Check if user exists by email
    if crud.user.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone already exists
    if crud.user.get_user_by_phone(db, user_data.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Generate username (YYMMDD + 4 random digits)
    date_part = dt.now().strftime("%y%m%d")
    random_part = str(random.randint(1000, 9999))
    username = date_part + random_part
    
    # Check if username already exists (unlikely but handle it)
    while get_user_by_username(db, username):
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
    referral_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    # Ensure referral code is unique
    while crud.user.get_user_by_referral_code(db, referral_code):
        referral_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    # Store the plain password temporarily for email
    plain_password = user_data.password
    
    # Create user
    user_dict = user_data.dict()
    user_dict["username"] = username
    user_dict["referral_code"] = referral_code
    user_dict["parent_id"] = parent_id
    user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
    
    db_user = User(**user_dict)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send credentials email in background
    background_tasks.add_task(
        email_service.send_credentials_email,
        to_email=user_data.email,
        username=username,
        password=plain_password,
        full_name=user_data.full_name
    )
    
    return db_user

# Add endpoint for resending credentials (optional)
@router.post("/resend-credentials")
async def resend_credentials(
    email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Resend login credentials to user's email"""
    user = crud.user.get_user_by_email(db, email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found with this email"
        )
    
    # Note: We cannot retrieve the plain password as it's hashed
    # In a real application, you should send a password reset link instead
    # or generate a temporary password
    
    # For now, we'll send a password reset prompt
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Please use password reset feature. Contact support if needed."
    )

# Standard OAuth2 login (form data)
@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """User login using OAuth2 standard form"""
    user = get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
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
    access_token = create_access_token(
        data={"sub": user.username, "role": "superadmin" if user.is_superadmin else "admin" if user.is_admin else "user"},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# Alternative JSON login endpoint
@router.post("/login-json", response_model=TokenData)
async def login_json(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Alternative login using JSON"""
    user = get_user_by_username(db, username=login_data.username)
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": "superadmin" if user.is_superadmin else "admin" if user.is_admin else "user"},
        expires_delta=access_token_expires
    )
    
    return TokenData(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

# Alternative form login (if you need custom form fields)
@router.post("/login-form")
async def login_form(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Alternative login using Form data"""
    user = get_user_by_username(db, username=username)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": "superadmin" if user.is_superadmin else "admin" if user.is_admin else "user"},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user info"""
    return current_user

@router.post("/logout")
async def logout():
    """User logout (client-side token invalidation)"""
    return {"message": "Successfully logged out"}

    # =================================================================================

    # =======================DELETE THISv================================

    # =================================================================================

# @router.post("/send-test-email")
# async def send_test_email(
#     email: str,
#     background_tasks: BackgroundTasks,
# ):
#     """Send a test email to verify email service is working"""
#     try:
#         # Send email using the same method as registration
#         background_tasks.add_task(
#             email_service.send_credentials_email,
#             to_email=email,
#             username="test_user",
#             password="test_password_123",
#             full_name="Test Recipient"
#         )
        
#         return {
#             "status": "success",
#             "message": "Test email has been sent",
#             "data": {
#                 "email": email,
#                 "note": "Check your inbox (and spam folder)"
#             }
#         }
        
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to send test email: {str(e)}"
#         )

# =================================================================================

# =======================DELETE THISv================================

# =================================================================================