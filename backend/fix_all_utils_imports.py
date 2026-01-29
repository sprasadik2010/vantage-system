#!/usr/bin/env python3
"""
Remove all utils.security.get_current_user imports
"""
import os

# List of router files
router_files = [
    "app/routers/users.py",
    "app/routers/upload.py",
    "app/routers/withdrawal.py",
    "app/routers/income.py",
    "app/routers/admin.py"
]

get_current_user_code = '''
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
'''

for filepath in router_files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Remove old imports
        lines = content.split('\n')
        new_lines = []
        
        for line in lines:
            # Skip lines with utils.security
            if 'utils.security.get_current_user' in line:
                continue
            # Skip imports of utils.security
            elif 'from ..utils.security' in line:
                continue
            else:
                new_lines.append(line)
        
        # Join back
        content = '\n'.join(new_lines)
        
        # Add necessary imports and function at the top
        if 'oauth2_scheme = OAuth2PasswordBearer' not in content:
            # Find where to insert imports
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'from ..database import get_db' in line:
                    # Insert imports after this
                    lines.insert(i + 1, "from fastapi.security import OAuth2PasswordBearer")
                    lines.insert(i + 2, "from jose import JWTError, jwt")
                    lines.insert(i + 3, "")
                    lines.insert(i + 4, "oauth2_scheme = OAuth2PasswordBearer(tokenUrl=\"auth/login\")")
                    break
            
            content = '\n'.join(lines)
        
        # Add get_current_user function before the routes
        if 'async def get_current_user' not in content:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if '@router' in line:
                    # Insert function before first route
                    lines.insert(i, get_current_user_code)
                    break
            
            content = '\n'.join(lines)
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"✅ Fixed {filepath}")

print("✅ All router files fixed!")