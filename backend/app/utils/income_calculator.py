from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from .. import models, crud
from ..config import settings

class IncomeCalculator:
    @staticmethod
    def calculate_referral_percentage(direct_referrals_count: int) -> float:
        """Calculate percentage based on direct referrals count"""
        if direct_referrals_count >= 5:
            return settings.INCOME_PERCENTAGES[5]
        elif direct_referrals_count >= 4:
            return settings.INCOME_PERCENTAGES[4]
        elif direct_referrals_count >= 3:
            return settings.INCOME_PERCENTAGES[3]
        elif direct_referrals_count >= 2:
            return settings.INCOME_PERCENTAGES[2]
        else:
            return settings.INCOME_PERCENTAGES[1]
    
    @staticmethod
    def distribute_income(
        db: Session,
        vantage_username: str,
        amount: float,
        income_type: str,
        excel_upload_id: int  # Keep parameter but don't use in Income creation
    ) -> Dict:
        """Distribute income to 5 levels up"""
        results = {
            "distributed": 0,
            "users_affected": 0,
            "errors": []
        }
        
        # Find target user by vantage username
        target_user = crud.user.get_user_by_vantage_username(db, vantage_username)
        if not target_user:
            results["errors"].append(f"User with vantage username '{vantage_username}' not found")
            return results
        
        current_user = target_user
        level = 1
        
        while current_user and level <= 5:
            # Get direct referrals count
            direct_count = crud.user.get_direct_referrals_count(db, current_user.id)
            
            # Calculate percentage for this level
            percentage = settings.INCOME_PERCENTAGES.get(level, 0)
            
            # Apply referral bonus
            if level == 1:
                percentage = IncomeCalculator.calculate_referral_percentage(direct_count)
            
            if percentage > 0:
                # Calculate income amount
                income_amount = amount * percentage
                
                # Create income record (without excel_upload_id)
                income_data = {
                    "user_id": current_user.id,
                    "amount": income_amount,
                    "percentage": percentage,
                    "level": level,
                    "income_type": income_type.upper(),
                    "source_vantage_username": vantage_username,
                    "source_income_amount": amount
                    # Removed: "excel_upload_id": excel_upload_id
                }
                
                income = crud.income.create_income(db, income_data)
                
                # Update user wallet
                current_user.wallet_balance += income_amount
                current_user.total_earned += income_amount
                db.commit()
                
                results["distributed"] += income_amount
                results["users_affected"] += 1
            
            # Move to parent
            current_user = current_user.parent
            level += 1
        return results