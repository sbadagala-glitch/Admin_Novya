# app/demo_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models_demo import DemoBooking
from .schemas import DemoBookingResponse, DemoStatusUpdate

router = APIRouter(prefix="/api/admin/demo", tags=["Demo Bookings"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[DemoBookingResponse])
def get_all_demo_bookings(db: Session = Depends(get_db)):
    return db.query(DemoBooking).order_by(DemoBooking.id.desc()).all()


@router.put("/{demo_id}/update", response_model=DemoBookingResponse)
def update_demo_status(demo_id: int, data: DemoStatusUpdate, db: Session = Depends(get_db)):

    demo = db.query(DemoBooking).filter(DemoBooking.id == demo_id).first()
    if not demo:
        raise HTTPException(status_code=404, detail="Demo request not found")

    demo.status = data.status
    demo.reason = data.reason or "-"

    db.commit()
    db.refresh(demo)

    return demo
