from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime

# -----------------------
# ADMIN USER
# -----------------------
class AdminUserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class AdminUserCreate(AdminUserBase):
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        special_chars = "!@#$%^&*(),.?\":{}|<>"
        if not any(c in special_chars for c in v):
            raise ValueError('Password must contain at least one special character')
        return v


class AdminUserLogin(BaseModel):
    email: EmailStr
    password: str


class AdminUserResponse(AdminUserBase):
    id: int
    is_active: bool
    is_super_admin: bool
    created_at: datetime
    last_login: Optional[datetime]

    # pydantic v2 compatible
    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: AdminUserResponse


# -----------------------
# DEMO BOOKING
# -----------------------
class DemoBookingResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: str
    course_of_interest: str
    preferred_time: str
    message: str
    status: str
    reason: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DemoStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = "-"


# -----------------------
# STUDENT CONTACT
# -----------------------
class ContactRequestCreate(BaseModel):
    full_name: str
    email: EmailStr
    help_topic: Optional[str]
    message: Optional[str]
    status: Optional[str] = "pending"


class ContactRequestResponse(BaseModel):
    id: int
    full_name: str
    email: str
    help_topic: Optional[str]
    message: Optional[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# -----------------------
# PARENT CONTACT
# -----------------------
class ParentContactRequestResponse(BaseModel):
    id: int
    parent_name: str
    student_name: str
    student_id: Optional[str]
    phone_number: str
    email: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


# -----------------------
# TEACHER CONTACT
# -----------------------
class TeacherContactRequestSchema(BaseModel):
    id: int
    teacher_name: str
    teacher_email: str
    teacher_id: str
    phone_number: str
    message: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# -----------------------
# USER (novya.users)
# -----------------------
class UserBase(BaseModel):
    userid: int
    firstname: Optional[str]
    lastname: Optional[str]
    email: Optional[EmailStr]
    username: Optional[str]
    phonenumber: Optional[str]
    role: Optional[str]
    createdat: Optional[datetime]
    is_active: Optional[bool]
    is_staff: Optional[bool]
    is_superuser: Optional[bool]
    date_joined: Optional[datetime]
    last_login: Optional[datetime]

    model_config = {"from_attributes": True}


class UserResponse(UserBase):
    pass


class UsersSummary(BaseModel):
    total: int
    recent: List[UserResponse]


# -----------------------
# CHANGE PASSWORD SCHEMA
# -----------------------
class ChangePassword(BaseModel):
    current_password: str
    new_password: str

    model_config = {"from_attributes": True}
