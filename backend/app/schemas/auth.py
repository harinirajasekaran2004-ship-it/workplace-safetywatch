from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"

class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole = UserRole.EMPLOYEE
    department: Optional[str] = "Operations & Facility"
    facility_location: Optional[str] = "Main Production Plant"

class UserCreate(UserBase):
    password: str = Field(min_length=4, description="User password")

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    created_at: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserResponse

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class SafetyChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user_name: Optional[str] = "Employee"

class SafetyChatResponse(BaseModel):
    reply: str
    is_relevant: bool
    matched_standards: Optional[List[str]] = []
    timestamp: str
