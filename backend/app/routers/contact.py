# app/routers/contact.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.contact import ContactMessage
from ..schemas.contact import ContactCreate, ContactResponse

router = APIRouter(prefix="/contact", tags=["contact"])

@router.post("/", response_model=ContactResponse)
async def create_contact_message(
    contact: ContactCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Create a new contact message (PUBLIC endpoint - no auth required).
    """
    try:
        # Create contact message
        db_contact = ContactMessage(
            name=contact.name,
            email=contact.email,
            subject=contact.subject,
            message=contact.message,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        
        db.add(db_contact)
        db.commit()
        db.refresh(db_contact)
        
        return db_contact
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ADMIN endpoints - these require authentication
@router.get("/", response_model=List[ContactResponse])
async def get_contact_messages(
    skip: int = 0,
    limit: int = 0,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # REMOVE THIS FOR NOW
):
    """
    Get all contact messages (admin only).
    TEMPORARILY REMOVED AUTH FOR TESTING
    """
    # TODO: Add auth back when you have the auth setup
    # if not current_user.is_admin and not current_user.is_superadmin:
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = db.query(ContactMessage)\
        .order_by(ContactMessage.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return messages

@router.patch("/{message_id}")
async def update_message_status(
    message_id: int,
    status: str,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(get_current_user)  # REMOVE THIS FOR NOW
):
    """
    Update message status (admin only).
    TEMPORARILY REMOVED AUTH FOR TESTING
    """
    # TODO: Add auth back when you have the auth setup
    # if not current_user.is_admin and not current_user.is_superadmin:
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    db_message = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Validate status
    valid_statuses = ["pending", "read", "replied", "closed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")
    
    db_message.status = status
    db.commit()
    db.refresh(db_message)
    
    return {"message": "Status updated successfully"}