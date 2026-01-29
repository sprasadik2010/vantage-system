#!/usr/bin/env python3
import os

# List of router files and their needed imports
router_fixes = {
    "auth.py": ["from ..schemas.user import UserCreate, UserResponse, UserLogin"],
    "users.py": ["from ..schemas.user import UserResponse, UserUpdate"],
    "income.py": ["from ..schemas.income import IncomeResponse"],
    "withdrawal.py": ["from ..schemas.withdrawal import WithdrawalResponse, WithdrawalCreate, WithdrawalUpdate"],
    "upload.py": ["from ..schemas.upload import ExcelUploadResponse, ExcelUploadCreate"],
    "admin.py": []  # No schema imports needed
}

for filename, imports in router_fixes.items():
    filepath = f"app/routers/{filename}"
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Remove all schemas. prefixes
        content = content.replace("schemas.user.", "")
        content = content.replace("schemas.income.", "")
        content = content.replace("schemas.withdrawal.", "")
        content = content.replace("schemas.upload.", "")
        
        # Add direct imports if needed
        if imports:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'from .. import' in line:
                    for imp in imports:
                        lines.insert(i + 1, imp)
                    break
            
            content = '\n'.join(lines)
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"✅ Fixed {filename}")

print("✅ All routers fixed!")