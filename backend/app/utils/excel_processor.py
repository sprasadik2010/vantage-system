import pandas as pd
from typing import List, Dict
from sqlalchemy.orm import Session
from .. import models, crud
from .income_calculator import IncomeCalculator
import os

class ExcelProcessor:
    @staticmethod
    def process_excel(
        db: Session,
        file_path: str,
        uploaded_by: int,
        upload_id: int
    ) -> Dict:
        """Process uploaded Excel file"""
        results = {
            "total_rows": 0,
            "processed_rows": 0,
            "error_rows": 0,
            "total_distributed": 0,
            "errors": []
        }
        
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            results["total_rows"] = len(df)
            
            # Validate required columns
            required_columns = ["vantage_username", "amount", "income_type"]
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                results["errors"].append(f"Missing required columns: {', '.join(missing_columns)}")
                return results
            
            # Process each row
            for index, row in df.iterrows():
                try:
                    vantage_username = str(row["vantage_username"]).strip()
                    amount = float(row["amount"])
                    income_type = str(row["income_type"]).strip().lower()
                    
                    # Validate income type
                    if income_type not in ["daily", "weekly", "monthly"]:
                        raise ValueError(f"Invalid income type: {income_type}")
                    
                    # Distribute income
                    distribution_result = IncomeCalculator.distribute_income(
                        db=db,
                        vantage_username=vantage_username,
                        amount=amount,
                        income_type=income_type,
                        excel_upload_id=upload_id
                    )
                    
                    results["processed_rows"] += 1
                    results["total_distributed"] += distribution_result["distributed"]
                    
                    if distribution_result["errors"]:
                        results["error_rows"] += 1
                        results["errors"].extend(distribution_result["errors"])
                        
                except Exception as e:
                    results["error_rows"] += 1
                    results["errors"].append(f"Row {index + 2}: {str(e)}")
            
            # Update upload record
            upload_record = db.query(models.ExcelUpload).filter(models.ExcelUpload.id == upload_id).first()
            if upload_record:
                upload_record.is_processed = True
                upload_record.processed_rows = results["processed_rows"]
                upload_record.error_rows = results["error_rows"]
                upload_record.total_distributed = results["total_distributed"]
                upload_record.processed_at = pd.Timestamp.now()
                db.commit()
            
        except Exception as e:
            results["errors"].append(f"Failed to process Excel file: {str(e)}")
        
        return results