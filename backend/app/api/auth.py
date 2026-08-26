import logging
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    AuthResponse
)
from app.db.store import store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication & Users"])

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate):
    """
    Registers a new Reporter or Manager account.
    """
    try:
        user_record = store.create_user(user_in.model_dump())
        token = f"jwt-session-{uuid.uuid4().hex}"
        return AuthResponse(
            success=True,
            message=f"Account for {user_record['name']} ({user_record['role']}) registered successfully.",
            token=token,
            user=UserResponse(**user_record)
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user."
        )

@router.post("/login", response_model=AuthResponse)
def login_user(credentials: UserLogin):
    """
    Authenticates user and returns role-based session token.
    """
    user = store.get_user_by_email(credentials.email)
    if not user or user.get("password") != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    token = f"jwt-session-{uuid.uuid4().hex}"
    return AuthResponse(
        success=True,
        message=f"Welcome back, {user['name']}!",
        token=token,
        user=UserResponse(**user)
    )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(role: Optional[str] = Query(None, description="Filter by employee or manager")):
    """
    Manager endpoint to view all registered facility personnel.
    """
    users = store.list_users(role=role)
    return [UserResponse(**u) for u in users]

@router.get("/me", response_model=UserResponse)
def get_current_user(email: str = Query(..., description="User email")):
    """
    Fetches the profile information for a user.
    """
    user = store.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{email}' not found."
        )
    return UserResponse(**user)
