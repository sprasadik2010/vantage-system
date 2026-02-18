import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Brand FX"
    PROJECT_VERSION: str = "1.0.0"
    
    # POSTGRES_USER: str = os.getenv("POSTGRES_USER", "vantage_user")
    # POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "HA6ntJUgIXBlq7zkjfqRkOB5rIwyKPZL")
    # POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "dpg-d5f4m5emcj7s73aviic0-a.oregon-postgres.render.com")
    # POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    # POSTGRES_DB: str = os.getenv("POSTGRES_DB", "vantagedb_pq0n")

    # psql 'postgresql://neondb_owner:npg_Y3Ll7VgxqdeS@ep-steep-sound-aiosesre-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "neondb_owner")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "npg_Y3Ll7VgxqdeS")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "ep-steep-sound-aiosesre-pooler.c-4.us-east-1.aws.neon.tech")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "neondb")


    DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # File upload settings
    UPLOAD_DIR: str = "app/static/uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Income distribution percentages
    INCOME_PERCENTAGES = {
        1: 0.02,  # 02% for level 1
        2: 0.02,  # 02% for level 2
        3: 0.02,  # 02% for level 3
        4: 0.02,  # 02% for level 4
        5: 0.02   # 02% for level 5
    }
    
    # Minimum withdrawal amount
    MIN_WITHDRAWAL_AMOUNT: float = 10.0

settings = Settings()