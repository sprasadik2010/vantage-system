# app/main.py
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import traceback
import logging

from .database import Base, engine, get_db
from .config import settings

# Import routers
from .routers.admin import router as admin_router
from .routers.auth import router as auth_router
from .routers.income import router as income_router
from .routers.upload import router as upload_router
from .routers.users import router as users_router
from .routers.withdrawal import router as withdrawal_router
from .routers.manual_distribution import router as manual_distribution_router
from .routers.contact import router as contact_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://brandfx.biz", "http://localhost:5173", "http://127.0.0.1:5173", "https://vantage-system.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def catch_exceptions(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Exception occurred: {str(e)}")
        logger.error(traceback.format_exc())
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"},
        )

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(income_router)
app.include_router(upload_router)
app.include_router(users_router)
app.include_router(withdrawal_router)
app.include_router(manual_distribution_router)
app.include_router(contact_router)

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

# Temporary simple routes
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