# from fastapi import FastAPI, Depends, HTTPException, status
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# from datetime import datetime, timedelta
# from jose import JWTError, jwt

# from .config import settings
# from .database import SessionLocal, engine, Base
# from .models import AdminUser, PasswordResetToken
# from .schemas import (
#     AdminUserCreate, AdminUserLogin, AdminUserResponse,
#     Token, ChangePassword
# )
# from . import admin_progress
# from .auth import verify_password, get_password_hash, verify_token, create_access_token
# from . import demo_routes
# # Create tables
# Base.metadata.create_all(bind=engine)

# # FastAPI app
# app = FastAPI(title="Admin Backend API", version="1.0.0")

# # CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.CORS_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Dependency (DB Session)
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # Routes
# @app.post("/api/auth/register", response_model=AdminUserResponse)
# def register(user: AdminUserCreate, db: Session = Depends(get_db)):
#     existing = db.query(AdminUser).filter(AdminUser.email == user.email).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="Email already exists")

#     new_user = AdminUser(
#         email=user.email,
#         first_name=user.first_name,
#         last_name=user.last_name,
#         password_hash=get_password_hash(user.password),  # Use the function from auth.py
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user

# @app.post("/api/auth/login", response_model=Token)
# def login(data: AdminUserLogin, db: Session = Depends(get_db)):
#     user = db.query(AdminUser).filter(AdminUser.email == data.email).first()
#     if not user or not verify_password(data.password, user.password_hash):  # Use the function from auth.py
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     access_token = create_access_token({"sub": user.email})

#     user.last_login = datetime.utcnow()
#     db.commit()

#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "user": AdminUserResponse.from_orm(user)  # Use from_orm for Pydantic v2
#     }

# @app.get("/api/auth/me", response_model=AdminUserResponse)
# def me(db: Session = Depends(get_db), token: str = Depends(verify_token)):
#     if not token:
#         raise HTTPException(status_code=401, detail="Invalid token")

#     email = token.get("sub")
#     user = db.query(AdminUser).filter(AdminUser.email == email).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     return AdminUserResponse.from_orm(user)  # Use from_orm for Pydantic v2

# @app.get("/api/health")
# def health():
#     return {"status": "healthy", "service": "Admin Backend API"}

# @app.get("/")
# def root():
#     return {"message": "Admin Backend API is running"}

# # ✅ ADD PROGRESS ROUTES HERE
# app.include_router(admin_progress.router)
# app.include_router(demo_routes.router)
# from fastapi import FastAPI, Depends, HTTPException, status
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# from datetime import datetime, timedelta
# from jose import JWTError, jwt
# from typing import List

# from .config import settings
# from .database import SessionLocal, engine, Base
# from .models import AdminUser, PasswordResetToken, ContactRequest
# from .schemas import (
#     AdminUserCreate, AdminUserLogin, AdminUserResponse,
#     Token, ChangePassword, ContactRequestResponse
# )
# from . import admin_progress
# from .auth import verify_password, get_password_hash, verify_token, create_access_token
# from . import demo_routes
# from . import crud

# # Create tables
# Base.metadata.create_all(bind=engine)

# # FastAPI app
# app = FastAPI(title="Admin Backend API", version="1.0.0")

# # CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.CORS_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Dependency (DB Session)
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # Routes
# @app.post("/api/auth/register", response_model=AdminUserResponse)
# def register(user: AdminUserCreate, db: Session = Depends(get_db)):
#     existing = db.query(AdminUser).filter(AdminUser.email == user.email).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="Email already exists")

#     new_user = AdminUser(
#         email=user.email,
#         first_name=user.first_name,
#         last_name=user.last_name,
#         password_hash=get_password_hash(user.password),  # Use the function from auth.py
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user

# @app.post("/api/auth/login", response_model=Token)
# def login(data: AdminUserLogin, db: Session = Depends(get_db)):
#     user = db.query(AdminUser).filter(AdminUser.email == data.email).first()
#     if not user or not verify_password(data.password, user.password_hash):  # Use the function from auth.py
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     access_token = create_access_token({"sub": user.email})

#     user.last_login = datetime.utcnow()
#     db.commit()

#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "user": AdminUserResponse.from_orm(user)  # Use from_orm for Pydantic v2
#     }

# @app.get("/api/auth/me", response_model=AdminUserResponse)
# def me(db: Session = Depends(get_db), token: str = Depends(verify_token)):
#     if not token:
#         raise HTTPException(status_code=401, detail="Invalid token")

#     email = token.get("sub")
#     user = db.query(AdminUser).filter(AdminUser.email == email).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     return AdminUserResponse.from_orm(user)  # Use from_orm for Pydantic v2

# @app.get("/api/health")
# def health():
#     return {"status": "healthy", "service": "Admin Backend API"}

# @app.get("/")
# def root():
#     return {"message": "Admin Backend API is running"}

# # ✅ ADD PROGRESS ROUTES HERE
# app.include_router(admin_progress.router)
# app.include_router(demo_routes.router)

# # --------------------------
# # NEW: ContactRequests API endpoints
# # - GET /api/contact-requests  -> returns list of contact requests
# # - GET /api/contact-requests/{id} -> returns single contact request
# # --------------------------
# @app.get("/api/contact-requests", response_model=List[ContactRequestResponse])
# def list_contact_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     """
#     Fetch contact requests from the database.
#     This reads from the 'contact_requests' table (created by Django).
#     """
#     items = crud.get_contact_requests(db=db, skip=skip, limit=limit)
#     return [ContactRequestResponse.from_orm(item) for item in items]

# @app.get("/api/contact-requests/{request_id}", response_model=ContactRequestResponse)
# def get_contact_request(request_id: int, db: Session = Depends(get_db)):
#     item = crud.get_contact_request(db=db, request_id=request_id)
#     if not item:
#         raise HTTPException(status_code=404, detail="Contact request not found")
#     return ContactRequestResponse.from_orm(item)



































# from fastapi import FastAPI, Depends, HTTPException, status
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# from typing import List
# from datetime import datetime

# from .config import settings
# from .database import SessionLocal, engine, Base
# from .models import (
#     AdminUser,
#     PasswordResetToken,
#     ContactRequest,
#     ParentContactRequest   # ✅ NEW
# )
# from .schemas import (
#     AdminUserCreate,
#     AdminUserLogin,
#     AdminUserResponse,
#     Token,
#     ChangePassword,
#     ContactRequestResponse
# )
# from .auth import (
#     verify_password,
#     get_password_hash,
#     verify_token,
#     create_access_token
# )
# from . import crud
# from . import admin_progress
# from . import demo_routes

# # ----------------------------------------
# # CREATE TABLES (keep existing)
# # ----------------------------------------
# Base.metadata.create_all(bind=engine)

# # ----------------------------------------
# # APP INIT (keep existing)
# # ----------------------------------------
# app = FastAPI(title="Admin Backend API", version="1.0.0")

# # ----------------------------------------
# # CORS (keep existing)
# # ----------------------------------------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.CORS_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ----------------------------------------
# # DB SESSION (keep existing)
# # ----------------------------------------
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # ----------------------------------------
# # AUTH: REGISTER (keep existing)
# # ----------------------------------------
# @app.post("/api/auth/register", response_model=AdminUserResponse)
# def register(user: AdminUserCreate, db: Session = Depends(get_db)):
#     existing = db.query(AdminUser).filter(AdminUser.email == user.email).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="Email already exists")

#     new_user = AdminUser(
#         email=user.email,
#         first_name=user.first_name,
#         last_name=user.last_name,
#         password_hash=get_password_hash(user.password),
#     )

#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user

# # ----------------------------------------
# # AUTH: LOGIN (keep existing)
# # ----------------------------------------
# @app.post("/api/auth/login", response_model=Token)
# def login(data: AdminUserLogin, db: Session = Depends(get_db)):
#     user = db.query(AdminUser).filter(AdminUser.email == data.email).first()

#     if not user or not verify_password(data.password, user.password_hash):
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     access_token = create_access_token({"sub": user.email})

#     user.last_login = datetime.utcnow()
#     db.commit()

#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "user": AdminUserResponse.from_orm(user)
#     }

# # ----------------------------------------
# # AUTH: ME (keep existing)
# # ----------------------------------------
# @app.get("/api/auth/me", response_model=AdminUserResponse)
# def me(db: Session = Depends(get_db), token: str = Depends(verify_token)):
#     if not token:
#         raise HTTPException(status_code=401, detail="Invalid token")

#     email = token.get("sub")
#     user = db.query(AdminUser).filter(AdminUser.email == email).first()

#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     return AdminUserResponse.from_orm(user)

# # ----------------------------------------
# # HEALTH CHECK (keep existing)
# # ----------------------------------------
# @app.get("/api/health")
# def health():
#     return {"status": "healthy", "service": "Admin Backend API"}

# # Root
# @app.get("/")
# def root():
#     return {"message": "Admin Backend API is running"}

# # ----------------------------------------
# # EXISTING ROUTERS (keep existing)
# # ----------------------------------------
# app.include_router(admin_progress.router)
# app.include_router(demo_routes.router)

# # ----------------------------------------
# # EXISTING — CONTACT REQUESTS (Student)
# # ----------------------------------------
# @app.get("/api/contact-requests", response_model=List[ContactRequestResponse])
# def list_contact_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     items = crud.get_contact_requests(db=db, skip=skip, limit=limit)
#     return [ContactRequestResponse.from_orm(item) for item in items]

# @app.get("/api/contact-requests/{request_id}", response_model=ContactRequestResponse)
# def get_contact_request(request_id: int, db: Session = Depends(get_db)):
#     item = crud.get_contact_request(db=db, request_id=request_id)
#     if not item:
#         raise HTTPException(status_code=404, detail="Contact request not found")
#     return ContactRequestResponse.from_orm(item)

# # ====================================================================
# # ✅ NEW: PARENT CONTACT REQUEST ENDPOINT  (USED BY ADMIN PANEL)
# # ====================================================================
# @app.get("/api/core/parent/contact/list/")
# def list_parent_contacts(db: Session = Depends(get_db)):
#     """
#     Fetch Parent Contact Requests submitted from Django frontend
#     and show inside Admin Panel → Support & Tickets → Parent Inquiries.
#     """
#     items = (
#         db.query(ParentContactRequest)
#         .order_by(ParentContactRequest.id.desc())
#         .all()
#     )

#     return {
#         "status": "success",
#         "total": len(items),
#         "data": [
#             {
#                 "id": i.id,
#                 "parent_name": i.parent_name,
#                 "student_name": i.student_namee,
#                 "student_id": i.student_id,
#                 "email": i.email,
#                 "phone_number": i.phone_number,
#                 "message": i.message,
#                 "created_at": i.created_at
#             }
#             for i in items
#         ]
#     }
from typing import List
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from .config import settings
from .database import SessionLocal, engine, Base

# -------------------------
# MODELS
# -------------------------
from .models import (
    AdminUser,
    PasswordResetToken,
    ContactRequest,
    ParentContactRequest,
    TeacherContactRequest,
    User   # ✅ correct novya.users table model
)

# -------------------------
# SCHEMAS
# -------------------------
from .schemas import (
    AdminUserLogin,
    AdminUserCreate,
    AdminUserResponse,
    Token,
    ContactRequestResponse,
    ParentContactRequestResponse,
    TeacherContactRequestSchema,
    UserResponse,
    UsersSummary,
    ChangePassword   # ✅ now exists in schemas.py
)

# -------------------------
# AUTH HELPERS
# -------------------------
from .auth import (
    verify_password,
    get_password_hash,
    verify_token,
    create_access_token
)

# -------------------------
# CRUD HELPERS
# -------------------------
from . import crud
from .crud import (
    get_users,
    get_total_users_count,
    get_recent_users
)

from . import admin_progress
from . import demo_routes

# ----------------------------------------
# CREATE TABLES
# ----------------------------------------
Base.metadata.create_all(bind=engine)

# ----------------------------------------
# APP INIT
# ----------------------------------------
app = FastAPI(title="Admin Backend API", version="1.0.0")

# ----------------------------------------
# CORS
# ----------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------
# DB SESSION
# ----------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------------------
# AUTH: REGISTER
# ----------------------------------------
@app.post("/api/auth/register", response_model=AdminUserResponse)
def register(user: AdminUserCreate, db: Session = Depends(get_db)):
    existing = db.query(AdminUser).filter(AdminUser.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = AdminUser(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        password_hash=get_password_hash(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ----------------------------------------
# AUTH: LOGIN
# ----------------------------------------
@app.post("/api/auth/login", response_model=Token)
def login(data: AdminUserLogin, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user.email})
    user.last_login = datetime.utcnow()
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": AdminUserResponse.from_orm(user)
    }


# ----------------------------------------
# AUTH: ME
# ----------------------------------------
@app.get("/api/auth/me", response_model=AdminUserResponse)
def me(db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = token.get("sub")
    user = db.query(AdminUser).filter(AdminUser.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return AdminUserResponse.model_validate(user)


# ----------------------------------------
# HEALTH CHECK
# ----------------------------------------
@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "Admin Backend API"}


@app.get("/")
def root():
    return {"message": "Admin Backend API is running"}


# ----------------------------------------
# ROUTERS
# ----------------------------------------
app.include_router(admin_progress.router)
app.include_router(demo_routes.router)


# ----------------------------------------
# CONTACT REQUESTS
# ----------------------------------------
@app.get("/api/contact-requests", response_model=List[ContactRequestResponse])
def list_contact_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.get_contact_requests(db=db, skip=skip, limit=limit)
    # Validate ORM -> Pydantic before returning to avoid 422
    return [ContactRequestResponse.model_validate(item) for item in items]


@app.get("/api/contact-requests/{request_id}", response_model=ContactRequestResponse)
def get_contact_request(request_id: int, db: Session = Depends(get_db)):
    item = crud.get_contact_request(db=db, request_id=request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Contact request not found")
    return ContactRequestResponse.model_validate(item)


# ====================================================================
# PARENT CONTACT REQUEST ENDPOINT
# ====================================================================
@app.get("/api/core/parent/contact/list/", response_model=List[ParentContactRequestResponse])
def list_parent_contacts(db: Session = Depends(get_db)):
    items = db.query(ParentContactRequest).order_by(ParentContactRequest.id.desc()).all()
    # return validated pydantic responses to avoid validation mismatch
    return [ParentContactRequestResponse.model_validate(item) for item in items]


# ====================================================================
# TEACHER ENQUIRIES
# ====================================================================
@app.get("/admin/teacher-enquiries", response_model=List[TeacherContactRequestSchema])
def get_teacher_enquiries(db: Session = Depends(get_db)):
    items = (
        db.query(TeacherContactRequest)
        .order_by(TeacherContactRequest.created_at.desc())
        .all()
    )
    return [TeacherContactRequestSchema.model_validate(item) for item in items]


# ====================================================================
# USERS (NOVYA USERS TABLE)
# ====================================================================

# All users
@app.get("/api/admin/users", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    items = crud.get_users(db=db, skip=skip, limit=limit)
    return [UserResponse.model_validate(u) for u in items]


# Total users + last 3 recent users
@app.get("/api/admin/users/summary", response_model=UsersSummary)
def users_summary(db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    total = crud.get_total_users_count(db=db)
    recent_items = crud.get_recent_users(db=db, days=30, limit=3)
    recent = [UserResponse.model_validate(u) for u in recent_items]

    return UsersSummary(total=total, recent=recent)

# ====================================================================
# RECENT REGISTRATIONS (ONLY LAST 3)
# ====================================================================
@app.get("/api/admin/users/recent", response_model=List[UserResponse])
def recent_registrations(db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    recent_items = crud.get_recent_users(db=db, days=30, limit=3)
    return [UserResponse.model_validate(u) for u in recent_items]
