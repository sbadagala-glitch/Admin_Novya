# app/models_demo.py

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class DemoBooking(Base):
    __tablename__ = "core_demobooking"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150))
    email = Column(String(255))
    phone_number = Column(String(15))
    course_of_interest = Column(String(150))
    preferred_time = Column(String(100))
    message = Column(Text)

    status = Column(String(50), default="pending")       # pending/completed/rejected
    reason = Column(Text, default="-")                   # reason text

    created_at = Column(DateTime(timezone=True), server_default=func.now())
