# from sqlalchemy.orm import Session
# from . import models, schemas, auth
# from datetime import datetime, timedelta
# import secrets
# from sqlalchemy import func, desc

# def get_admin_user_by_email(db: Session, email: str):
#     return db.query(models.AdminUser).filter(models.AdminUser.email == email).first()

# def authenticate_admin_user(db: Session, email: str, password: str):
#     user = get_admin_user_by_email(db, email)
#     if not user:
#         return None
#     if not auth.verify_password(password, user.password_hash):
#         return None
#     return user

# def create_admin_user(db: Session, user: schemas.AdminUserCreate):
#     db_user = get_admin_user_by_email(db, user.email)
#     if db_user:
#         return None
    
#     hashed_password = auth.get_password_hash(user.password)
#     db_user = models.AdminUser(
#         email=user.email,
#         first_name=user.first_name,
#         last_name=user.last_name,
#         password_hash=hashed_password,
#         created_at=datetime.utcnow()
#     )
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
#     return db_user

# def update_last_login(db: Session, user_id: int):
#     user = db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
#     if user:
#         user.last_login = datetime.utcnow()
#         db.commit()
#         db.refresh(user)
#     return user

# def create_password_reset_token(db: Session, email: str):
#     db.query(models.PasswordResetToken).filter(
#         models.PasswordResetToken.email == email
#     ).delete()
    
#     token = secrets.token_urlsafe(32)
#     expires_at = datetime.utcnow() + timedelta(hours=1)
    
#     db_token = models.PasswordResetToken(
#         email=email,
#         token=token,
#         expires_at=expires_at
#     )
#     db.add(db_token)
#     db.commit()
#     return token

# def verify_password_reset_token(db: Session, token: str):
#     db_token = db.query(models.PasswordResetToken).filter(
#         models.PasswordResetToken.token == token,
#         models.PasswordResetToken.expires_at > datetime.utcnow(),
#         models.PasswordResetToken.used == False
#     ).first()
#     return db_token

# def reset_password(db: Session, token: str, new_password: str):
#     db_token = verify_password_reset_token(db, token)
#     if not db_token:
#         return None
    
#     user = get_admin_user_by_email(db, db_token.email)
#     if not user:
#         return None
    
#     user.password_hash = auth.get_password_hash(new_password)
#     db_token.used = True
#     db.commit()
#     return user

# def change_password(db: Session, user_id: int, current_password: str, new_password: str):
#     user = db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
#     if not user or not auth.verify_password(current_password, user.password_hash):
#         return None
    
#     user.password_hash = auth.get_password_hash(new_password)
#     db.commit()
#     return user



# # --------------------------
# # ContactRequest CRUD helpers
# # --------------------------
# def get_contact_requests(db: Session, skip: int = 0, limit: int = 100):
#     return db.query(models.ContactRequest).order_by(
#         models.ContactRequest.created_at.desc()
#     ).offset(skip).limit(limit).all()

# def get_contact_request(db: Session, request_id: int):
#     return db.query(models.ContactRequest).filter(
#         models.ContactRequest.id == request_id
#     ).first()


# # --------------------------
# # USER CRUD helpers (novya.users)
# # --------------------------
# def get_users(db: Session, skip: int = 0, limit: int = 100):
#     # order by createdat desc — if createdat is NULL, DB will place it accordingly
#     return db.query(models.User).order_by(
#         models.User.createdat.desc()
#     ).offset(skip).limit(limit).all()


# def get_total_users_count(db: Session):
#     # Must use userid instead of id (novya.users uses userid)
#     return db.query(func.count(models.User.userid)).scalar() or 0


# def get_recent_users(db: Session, days: int = 30, limit: int = 3):
#     cutoff = datetime.utcnow() - timedelta(days=days)

#     # Exclude rows where createdat is NULL and filter on cutoff
#     return (
#         db.query(models.User)
#         .filter(models.User.createdat != None)
#         .filter(models.User.createdat >= cutoff)
#         .order_by(models.User.createdat.desc())
#         .limit(limit)
#         .all()
#     )
# def create_student_enquiry(db: Session, student_id: int, name: str, email: str, issue: str):
#     enquiry = models.StudentEnquiry(
#         student_id=student_id,
#         name=name,
#         email=email,
#         main_issue=issue
#     )
#     db.add(enquiry)
#     db.commit()
#     db.refresh(enquiry)
#     return enquiry


# def get_student_enquiries(db: Session):
#     return db.query(models.StudentEnquiry).order_by(models.StudentEnquiry.id.desc()).all()


from sqlalchemy.orm import Session
from . import models, schemas, auth
from datetime import datetime, timedelta
import secrets
from sqlalchemy import func, desc

def get_admin_user_by_email(db: Session, email: str):
    return db.query(models.AdminUser).filter(models.AdminUser.email == email).first()

def authenticate_admin_user(db: Session, email: str, password: str):
    user = get_admin_user_by_email(db, email)
    if not user:
        return None
    if not auth.verify_password(password, user.password_hash):
        return None
    return user

def create_admin_user(db: Session, user: schemas.AdminUserCreate):
    db_user = get_admin_user_by_email(db, user.email)
    if db_user:
        return None
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.AdminUser(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        password_hash=hashed_password,
        created_at=datetime.utcnow()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_last_login(db: Session, user_id: int):
    user = db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
    if user:
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
    return user

def create_password_reset_token(db: Session, email: str):
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.email == email
    ).delete()
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    db_token = models.PasswordResetToken(
        email=email,
        token=token,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    return token

def verify_password_reset_token(db: Session, token: str):
    db_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == token,
        models.PasswordResetToken.expires_at > datetime.utcnow(),
        models.PasswordResetToken.used == False
    ).first()
    return db_token

def reset_password(db: Session, token: str, new_password: str):
    db_token = verify_password_reset_token(db, token)
    if not db_token:
        return None
    
    user = get_admin_user_by_email(db, db_token.email)
    if not user:
        return None
    
    user.password_hash = auth.get_password_hash(new_password)
    db_token.used = True
    db.commit()
    return user

def change_password(db: Session, user_id: int, current_password: str, new_password: str):
    user = db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()
    if not user or not auth.verify_password(current_password, user.password_hash):
        return None
    
    user.password_hash = auth.get_password_hash(new_password)
    db.commit()
    return user



# --------------------------
# ContactRequest CRUD helpers
# --------------------------
def get_contact_requests(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ContactRequest).order_by(
        models.ContactRequest.created_at.desc()
    ).offset(skip).limit(limit).all()

def get_contact_request(db: Session, request_id: int):
    return db.query(models.ContactRequest).filter(
        models.ContactRequest.id == request_id
    ).first()


# --------------------------
# USER CRUD helpers (novya.users)
# --------------------------
def get_users(db: Session, skip: int = 0, limit: int = 100):
    # order by createdat desc — if createdat is NULL, DB will place it accordingly
    return db.query(models.User).order_by(
        models.User.createdat.desc()
    ).offset(skip).limit(limit).all()


def get_total_users_count(db: Session):
    # Must use userid instead of id (novya.users uses userid)
    return db.query(func.count(models.User.userid)).scalar() or 0


def get_recent_users(db: Session, days: int = 30, limit: int = 3):
    cutoff = datetime.utcnow() - timedelta(days=days)

    # Exclude rows where createdat is NULL and filter on cutoff
    return (
        db.query(models.User)
        .filter(models.User.createdat != None)
        .filter(models.User.createdat >= cutoff)
        .order_by(models.User.createdat.desc())
        .limit(limit)
        .all()
    )

def create_student_enquiry(db: Session, student_id: int, name: str, email: str, issue: str, chat_history: list = None):
    """
    Creates a StudentEnquiry record.
    chat_history is optional (list of {role, content} objects). Backwards compatible.
    """
    enquiry = models.StudentEnquiry(
        student_id=student_id,
        name=name,
        email=email,
        main_issue=issue,
        chat_history=chat_history
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry


def get_student_enquiries(db: Session):
    return db.query(models.StudentEnquiry).order_by(models.StudentEnquiry.id.desc()).all()
