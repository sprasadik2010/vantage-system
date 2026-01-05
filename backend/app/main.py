from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .config import settings

# Import ONLY auth router for now (it's working)
from .routers.auth import router as auth_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include ONLY auth router for now
app.include_router(auth_router)

# Simple test routes
@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.PROJECT_VERSION,
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "auth": "working"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database connection failed")

# Temporary simple routes (comment these out later when real routers work)
@app.get("/admin/test")
def admin_test():
    return {"message": "Admin route placeholder"}

@app.get("/users/test")
def users_test():
    return {"message": "Users route placeholder"}

@app.post("/upload/test")
def upload_test():
    return {"message": "Upload route placeholder"}

@app.get("/income/test")
def income_test():
    return {"message": "Income route placeholder"}

@app.get("/withdrawal/test")
def withdrawal_test():
    return {"message": "Withdrawal route placeholder"}