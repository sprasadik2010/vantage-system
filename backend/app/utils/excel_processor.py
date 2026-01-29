import pandas as pd
from io import BytesIO
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Dict
import traceback

class ExcelProcessor:
    
    @staticmethod
    def process_excel_sync(
        db: Session,
        file_data: bytes,
        uploaded_by: int,
        upload_id: int
    ) -> Dict:
        """Process Excel file synchronously"""
        print(f"=== STARTING EXCEL PROCESSING ===")
        
        results = {
            "total_rows": 0,
            "processed_rows": 0,
            "error_rows": 0,
            "total_distributed": 0.0,
            "errors": []
        }
        
        try:
            # Import IncomeCalculator
            from ..utils.income_calculator import IncomeCalculator
            
            # Process using BytesIO
            excel_file = BytesIO(file_data)
            
            # Read Excel file
            print("Reading Excel file...")
            df = pd.read_excel(excel_file)
            results["total_rows"] = len(df)
            print(f"Excel rows found: {results['total_rows']}")
            print(f"Excel columns: {df.columns.tolist()}")
            
            # Validate required columns
            required_columns = ['vantage_username', 'amount']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            # Process each row for income distribution
            for index, row in df.iterrows():
                row_number = index + 2  # Excel row number (1 for header + 1 for 0-index)
                try:
                    # Get data from Excel row
                    vantage_username = str(row['vantage_username']).strip()
                    amount = float(row['amount'])
                    income_type = str(row.get('income_type', 'DAILY')).strip()  
                    
                    print(f"Processing row {row_number}: {vantage_username}, {amount}, {income_type.upper()}")
                    
                    # Validate required fields
                    if not vantage_username:
                        raise ValueError("vantage_username cannot be empty")
                    if amount <= 0:
                        raise ValueError("amount must be positive")
                    
                    # Call IncomeCalculator to distribute income
                    distribution_result = IncomeCalculator.distribute_income(
                        db=db,
                        vantage_username=vantage_username,
                        amount=amount,
                        income_type=income_type.upper(),
                        excel_upload_id=upload_id
                    )
                    
                    # Debug the distribution result structure
                    print(f"Distribution result keys: {distribution_result.keys() if isinstance(distribution_result, dict) else 'Not a dict'}")
                    
                    if distribution_result.get("errors"):
                        results["error_rows"] += 1
                        error_msg = f"Row {row_number}: {', '.join(distribution_result['errors'])}"
                        results["errors"].append(error_msg)
                        print(f"  -> ERROR: {error_msg}")
                    else:
                        results["processed_rows"] += 1
                        results["total_distributed"] += distribution_result.get("distributed", 0)
                        
                        print(f"  -> SUCCESS: Distributed {distribution_result.get('distributed', 0)} to {distribution_result.get('users_affected', 0)} users")
                    
                except KeyError as e:
                    results["error_rows"] += 1
                    error_msg = f"Row {row_number}: Missing column - {str(e)}"
                    results["errors"].append(error_msg)
                    print(f"  -> KEY ERROR: {error_msg}")
                except ValueError as e:
                    results["error_rows"] += 1
                    error_msg = f"Row {row_number}: Invalid data format - {str(e)}"
                    results["errors"].append(error_msg)
                    print(f"  -> VALUE ERROR: {error_msg}")
                except Exception as e:
                    results["error_rows"] += 1
                    error_msg = f"Row {row_number}: {str(e)}"
                    results["errors"].append(error_msg)
                    print(f"  -> EXCEPTION: {error_msg}")
                    traceback.print_exc()
            
            print(f"\n=== PROCESSING SUMMARY ===")
            print(f"Total rows: {results['total_rows']}")
            print(f"Processed rows: {results['processed_rows']}")
            print(f"Error rows: {results['error_rows']}")
            print(f"Total distributed: {results['total_distributed']}")
            print(f"Errors: {len(results['errors'])}")
            
            if results["errors"]:
                print("First few errors:")
                for i, error in enumerate(results["errors"][:5]):
                    print(f"  {i+1}. {error}")
            
            # Update ExcelUpload record with results
            try:
                from app import models
                upload = db.query(models.ExcelUpload).filter(models.ExcelUpload.id == upload_id).first()
                
                if upload:
                    print(f"\nUpdating upload record ID: {upload.id}")
                    upload.total_rows = results["total_rows"]
                    upload.processed_rows = results["processed_rows"]
                    upload.error_rows = results["error_rows"]
                    upload.total_distributed = results["total_distributed"]
                    upload.is_processed = True
                    upload.processed_at = datetime.now()
                    db.commit()
                    print("Database updated successfully")
                else:
                    print(f"ERROR: Upload record {upload_id} not found!")
                    results["errors"].append(f"Upload record {upload_id} not found in database")
                    
            except Exception as e:
                print(f"ERROR updating database: {str(e)}")
                traceback.print_exc()
                results["errors"].append(f"Database update error: {str(e)}")
            
            return results
            
        except Exception as e:
            print(f"MAIN PROCESSING ERROR: {str(e)}")
            traceback.print_exc()
            
            error_msg = f"Failed to process file: {str(e)}"
            results["errors"].append(error_msg)
            results["error_rows"] = results["total_rows"]  # Mark all rows as errored
            
            # Still mark as processed even if error
            try:
                from app import models
                upload = db.query(models.ExcelUpload).filter(models.ExcelUpload.id == upload_id).first()
                if upload:
                    upload.is_processed = True
                    upload.processed_at = datetime.now()
                    upload.error_rows = results["error_rows"]
                    db.commit()
                    print(f"Marked upload {upload_id} as processed with error")
            except Exception as inner_e:
                print(f"Failed to update error status: {str(inner_e)}")
            
            return results