"""
Database migration script for initial setup.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
from .config import settings

def create_tables():
    """Create all database tables"""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def drop_tables():
    """Drop all database tables"""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.drop_all(bind=engine)
    print("🗑️  Database tables dropped!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "create":
            create_tables()
        elif sys.argv[1] == "drop":
            drop_tables()
        elif sys.argv[1] == "reset":
            drop_tables()
            create_tables()
        else:
            print("Usage: python migrations.py [create|drop|reset]")
    else:
        create_tables()