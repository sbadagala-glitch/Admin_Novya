# app/models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_super_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False)
    token = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# --------------------------
# EXISTING: ContactRequest
# --------------------------
class ContactRequest(Base):
    __tablename__ = "contact_requests"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    help_topic = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ContactRequest {self.id} {self.full_name}>"


# ----------------------------------------------
# NEW MODEL: Parent Contact Request
# ----------------------------------------------
class ParentContactRequest(Base):
    __tablename__ = "parent_contact_requests"

    id = Column(Integer, primary_key=True, index=True)
    parent_name = Column(String(255), nullable=False)
    student_name = Column(String(255), nullable=False)
    student_id = Column(String(100), nullable=True)
    phone_number = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    # Use DB server default timestamp for consistency
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TeacherContactRequest(Base):
    __tablename__ = "teacher_contact_requests"

    id = Column(Integer, primary_key=True, index=True)
    teacher_name = Column(String(150))
    teacher_email = Column(String(254))
    teacher_id = Column(String(50))
    phone_number = Column(String(20))
    message = Column(Text)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ----------------------------------------------
# USER model mapped EXACTLY to novya.users table
# ----------------------------------------------
class User(Base):
    __tablename__ = "users"  

    userid = Column(Integer, primary_key=True, index=True)
    firstname = Column(String(100))
    lastname = Column(String(100))
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    username = Column(String(150))
    phonenumber = Column(String(20))
    role = Column(String(50))
    createdat = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    is_staff = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    date_joined = Column(DateTime(timezone=True), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<User {self.userid} {self.email}>"
    

class StudentEnquiry(Base):
    __tablename__ = "student_enquiries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer)
    name = Column(String(255))
    email = Column(String(255))
    main_issue = Column(Text)
    # Store full chat if you want later; JSON maps nicely to Postgres json/jsonb
    chat_history = Column(JSON, nullable=True)
    status = Column(String(20), default="New Request")
    type = Column(String(50), default="student-support")
    created_at = Column(DateTime, server_default=func.now())
