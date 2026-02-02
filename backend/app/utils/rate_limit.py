# utils/rate_limit.py
from functools import wraps
from fastapi import HTTPException, Request
import time

def rate_limit(limit: int = 5, minutes: int = 15):
    """
    Decorator to limit the number of requests from an IP address.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            # Simple in-memory rate limiting (consider Redis for production)
            from ..main import app
            ip = request.client.host if request.client else "unknown"
            
            # Generate a unique key for this IP and endpoint
            key = f"rate_limit:{ip}:{request.url.path}"
            
            # Get current count and timestamp
            current_time = time.time()
            if not hasattr(app.state, 'rate_limit_data'):
                app.state.rate_limit_data = {}
            
            if key in app.state.rate_limit_data:
                count, timestamp = app.state.rate_limit_data[key]
                
                # Check if time window has passed
                if current_time - timestamp < minutes * 60:
                    if count >= limit:
                        raise HTTPException(
                            status_code=429,
                            detail=f"Too many requests. Please try again in {minutes} minutes."
                        )
                    app.state.rate_limit_data[key] = (count + 1, timestamp)
                else:
                    app.state.rate_limit_data[key] = (1, current_time)
            else:
                app.state.rate_limit_data[key] = (1, current_time)
            
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator