# app/main.py
from typing import List, Optional, Dict, Any
from fastapi import Depends, FastAPI, HTTPException, status, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta

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
    User,
    StudentEnquiry
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
    ChangePassword,
    StudentEnquiryCreate,
    StudentEnquiryOut
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
    get_recent_users,
    create_student_enquiry,
    get_student_enquiries
)

from . import admin_progress
from . import demo_routes

# -------------------------
# OPENROUTER CLIENT (FIXED)
# -------------------------
from openai import OpenAI   # keep original import

# ✅ Correct OpenRouter client (NO OPENAI ENDPOINT)
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY
)

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


# ---------------------------------------------------
# AUTH ENDPOINTS (REGISTER / LOGIN / ME)
# ---------------------------------------------------
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
# HEALTH CHECK + ROOT
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
# NOVYA USERS TABLE
# ====================================================================
@app.get("/api/admin/users", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    items = crud.get_users(db=db, skip=skip, limit=limit)
    return [UserResponse.model_validate(u) for u in items]


@app.get("/api/admin/users/summary", response_model=UsersSummary)
def users_summary(db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    total = crud.get_total_users_count(db=db)
    recent_items = crud.get_recent_users(db=db, days=30, limit=3)
    recent = [UserResponse.model_validate(u) for u in recent_items]
    return UsersSummary(total=total, recent=recent)


@app.get("/api/admin/users/recent", response_model=List[UserResponse])
def recent_registrations(
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    token: dict = Depends(verify_token),
):
    """
    Returns recent registrations (last 30 days).
    Optional role filter: student | parent | teacher
    """

    query = db.query(User)

    # last 30 days filter
    query = query.filter(
        User.createdat >= datetime.utcnow() - timedelta(days=30)
    )

    # ✅ ROLE FILTER (MAIN FIX)
    if role:
        query = query.filter(User.role.ilike(role))

    items = (
        query
        .order_by(User.createdat.desc())
        .limit(3)
        .all()
    )

    return [UserResponse.model_validate(u) for u in items]



# ====================================================================
# ⭐ FINAL — STUDENT ENQUIRY ENDPOINT (UPDATED FOR OPENROUTER)
# ====================================================================

@app.post("/api/chatbot/enquiry", response_model=StudentEnquiryOut)
def save_chatbot_issue(data: StudentEnquiryCreate, db: Session = Depends(get_db)):
    chat_text = ""
    for msg in data.chat_history:
        if msg.get("role") == "user":
            chat_text += f"Student: {msg.get('content')}\n"
        else:
            chat_text += f"Bot: {msg.get('content')}\n"

    prompt = f"""
    Extract ONLY the student's main problem.
    Return a single clear sentence.

    Chat:
    {chat_text}
    """

    # ✅ FIXED: Correct model & OpenRouter usage
    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[{"role": "system", "content": prompt}]
    )

    # issue = response.choices[0].message["content"].strip()
    issue = response.choices[0].message.content.strip()

    enquiry = create_student_enquiry(
        db=db,
        student_id=data.student_id,
        name=data.name,
        email=data.email,
        issue=issue,
        chat_history=data.chat_history
    )

    return enquiry


@app.get("/api/student-enquiries", response_model=List[StudentEnquiryOut])
def fetch_student_enquiries(db: Session = Depends(get_db)):
    return get_student_enquiries(db)


# ---------------------------------------------------------------------
# NEW: Helper functions for analytics + AI insight
# ---------------------------------------------------------------------
def safe_execute(db: Session, sql: str, params: Dict[str, Any] = None):
    """
    Run raw SQL and return rows as list of dicts.
    Uses a plain engine connection rather than the ORM Session to avoid
    leaving the session in an aborted transaction on SQL errors.
    Returns [] on failure and prints the error.
    """
    params = params or {}
    try:
        with engine.connect() as conn:
            res = conn.execute(text(sql), params)
            cols = res.keys()
            rows = [dict(zip(cols, r)) for r in res.fetchall()]
            return rows
    except Exception as e:
        # Print error for debugging but return empty list (we don't want to abort callers)
        print("safe_execute SQL error:", e)
        return []


def table_exists(table_name: str) -> bool:
    """
    Checks if a table exists in the connected Postgres database.
    Uses to_regclass which returns NULL if the table doesn't exist.
    """
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT to_regclass(:t) AS rc"), {"t": table_name})
            row = res.fetchone()
            if row and row[0]:
                return True
    except Exception as e:
        print("table_exists check error:", e)
    return False


def generate_ai_insight(average: Optional[float], improvement: Optional[float], completion: Optional[float]):
    """
    Very small deterministic AI-insight generator.
    Uses thresholds to create a short insight string.
    """
    try:
        avg = float(average or 0)
    except Exception:
        avg = 0.0
    try:
        imp = float(improvement or 0)
    except Exception:
        imp = 0.0
    try:
        comp = float(completion or 0)
    except Exception:
        comp = 0.0

    if avg >= 85 and comp >= 80:
        return "Excellent performance — keep reinforcing with advanced tasks."
    if avg >= 75 and imp >= 5:
        return "Strong and improving — consider challenge assignments."
    if avg >= 65 and comp >= 50:
        return "Steady performance; focus on targeted practice in weak topics."
    if avg < 65:
        return "Needs support — recommend remedial sessions and practice."
    return "Consistent — monitor progress and provide regular practice."


# ---------------------------------------------------------------------
# NEW: Subjects endpoint (returns list of subjects used in attempts)
# GET /api/dashboard/{role}/subjects?class=7&board=CBSE
# ---------------------------------------------------------------------
@app.get("/api/dashboard/{role}/subjects")
def get_subjects_for_role(role: str, class_param: Optional[str] = Query(None, alias="class"), board: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """
    Returns a JSON like: { "subjects": ["Math","Science", ...] }
    Role is one of student|parent|teacher (not strictly enforced here).
    It derives distinct subject names from quiz_attempt table (preferred).
    """
    # Use quiz_attempt.subject as canonical source (user selected Option A earlier)
    sql = """
        SELECT DISTINCT subject
        FROM quiz_attempt
        WHERE subject IS NOT NULL
        {class_filter}
        ORDER BY subject
        LIMIT 200
    """
    class_filter = ""
    params = {}
    if class_param:
        class_filter = "AND class_name = :class_name"
        params["class_name"] = str(class_param)

    sql = sql.format(class_filter=class_filter)
    rows = safe_execute(db, sql, params)
    subjects = [r["subject"] for r in rows if r.get("subject")]
    if not subjects:
        # Fallback: return a small default set
        subjects = ["Math", "Science", "English", "Social"]
    return {"subjects": subjects}


# ---------------------------------------------------------------------
# FINAL UPDATED: Student Progress endpoint (full subject list + fixed mock test mapping)
# ---------------------------------------------------------------------
@app.get("/api/dashboard/student/progress")
def student_progress(
    class_param: Optional[str] = Query(None, alias="class"),
    assessment: Optional[str] = Query("mocktest"),
    db: Session = Depends(get_db),
):
    """
    Returns full subject insights for all students, even if they have no attempts.
    Handles "Mock Tests" → quiz mapping and class name normalization.
    """

    # FULL SUBJECT LIST YOU SELECTED (Option B)
    ALL_SUBJECTS = [
        "Mathematics",
        "Science",
        "Social Science",
        "English",
        "Hindi",
        "Computers",
    ]

    # -------------------------------------------------------
    # CLASS MAPPING (UI → DB)
    # -------------------------------------------------------
    class_map = {
        "6": "6th",
        "7": "7th",
        "8": "8th",
        "9": "9th",
        "10": "10th"
    }

    db_class = class_map.get(str(class_param), None)

    class_filter = ""
    params = {}

    if db_class:
        class_filter = "AND qa.class_name = :cls"
        params["cls"] = db_class

    # -------------------------------------------------------
    # ASSESSMENT NORMALIZATION
    # -------------------------------------------------------
    # UI sends many versions: "Mock Tests", "Mock Test", "mocktests", "mocktest"
    normalized = assessment.lower().replace(" ", "")

    if normalized in ["mocktest", "mocktests"]:
        quiz_type_filter = "AND qa.quiz_type = 'quiz'"
    elif normalized == "quiz":
        quiz_type_filter = "AND qa.quiz_type = 'quiz'"
    else:
        # default → quiz, since DB only contains quiz + ai_generated
        quiz_type_filter = "AND qa.quiz_type = 'quiz'"

    # -------------------------------------------------------
    # MAIN QUERY
    # -------------------------------------------------------
    sql = f"""
        SELECT
            qa.student_id,
            COALESCE(sp.student_username, u.firstname || ' ' || u.lastname, '') AS student_name,
            qa.subject,
            AVG(qa.score) AS avg_score,
            AVG(COALESCE(qa.completion_percentage,0)) AS avg_completion
        FROM quiz_attempt qa
        LEFT JOIN student_profile sp
            ON sp.student_id::text = qa.student_id::text
        LEFT JOIN users u
            ON u.userid::text = qa.student_id::text
        WHERE 1=1
            {quiz_type_filter}
            {class_filter}
        GROUP BY qa.student_id, qa.subject, sp.student_username, u.firstname, u.lastname
        ORDER BY qa.student_id
    """

    rows = safe_execute(db, sql, params)

    # -------------------------------------------------------
    # BUILD STUDENT STRUCTURES
    # -------------------------------------------------------
    students_map = {}

    for r in rows:
        sid = str(r["student_id"])
        subject = r["subject"]

        # initialize student object with 0 for all subjects
        if sid not in students_map:
            students_map[sid] = {
                "id": r["student_id"],
                "name": r["student_name"] or f"Student {sid}",
                "scores": {sub: 0 for sub in ALL_SUBJECTS},
                "average": 0,
                "topSubject": None,
                "improvement": 0,
                "completion": 0,
                "aiInsight": "",
            }

        # populate actual score only if subject exists in list
        if subject in ALL_SUBJECTS:
            students_map[sid]["scores"][subject] = round(float(r["avg_score"] or 0), 2)

    # -------------------------------------------------------
    # OVERALL AVERAGES
    # -------------------------------------------------------
    overall_sql = f"""
        SELECT
            qa.student_id,
            AVG(qa.score) AS overall_avg,
            AVG(COALESCE(qa.completion_percentage,0)) AS overall_completion
        FROM quiz_attempt qa
        WHERE 1=1
            {quiz_type_filter}
            {class_filter}
        GROUP BY qa.student_id
    """

    overall_rows = safe_execute(db, overall_sql, params)

    for r in overall_rows:
        sid = str(r["student_id"])
        if sid in students_map:
            avg = float(r["overall_avg"] or 0)
            comp = float(r["overall_completion"] or 0)

            students_map[sid]["average"] = round(avg, 2)
            students_map[sid]["completion"] = round(comp, 2)

            # determine top subject
            scores = students_map[sid]["scores"]
            if scores:
                students_map[sid]["topSubject"] = max(scores, key=scores.get)

            # AI Insight remains simple for now
            students_map[sid]["aiInsight"] = generate_ai_insight(avg, 0, comp)

    students_list = list(students_map.values())

    # -------------------------------------------------------
    # SUBJECT AVERAGES ACROSS CLASS (ALL SUBJECTS INCLUDED)
    # -------------------------------------------------------
    subject_averages = {}
    for sub in ALL_SUBJECTS:
        values = [st["scores"][sub] for st in students_list]
        subject_averages[sub] = round(sum(values) / len(values), 2) if values else 0

    # -------------------------------------------------------
    # FINAL RESPONSE
    # -------------------------------------------------------
    return {
        "className": f"Class {class_param}",
        "subjects": ALL_SUBJECTS,
        "subjectAverages": subject_averages,
        "students": students_list,
    }


# ---------------------------------------------------------------------
# NEW: Parent endpoints
# GET /api/dashboard/parent/{parent_email}/children
# GET /api/dashboard/parent/{parent_email}/progress
# ---------------------------------------------------------------------
@app.get("/api/dashboard/parent/{parent_email}/children")
def parent_children(parent_email: str = Path(..., description="Parent email"), db: Session = Depends(get_db)):
    """
    Returns list of children linked to parent_email using student_profile.parent_email
    Response shape: [ { student_id, name } ]
    """
    try:
        sql = """
            SELECT student_id, student_username
            FROM student_profile
            WHERE parent_email = :pemail
            ORDER BY student_username
        """
        rows = safe_execute(db, sql, {"pemail": parent_email})
        children = [{"student_id": r["student_id"], "name": r.get("student_username") or f"Student {r['student_id']}"} for r in rows]
        return children
    except Exception as e:
        print("parent_children exception:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch parent children")


@app.get("/api/dashboard/parent/{parent_email}/progress")
def parent_progress(parent_email: str = Path(..., description="Parent email"), db: Session = Depends(get_db)):
    """
    Returns an object:
    {
      "parent_email": "...",
      "children": [
         { student_id, child_name, subjects, scores: {sub:score}, average, best_subject, weak_subject, completion, ai_insight }
      ]
    }
    """
    try:
        # fetch children
        child_rows = safe_execute(db, "SELECT student_id, student_username FROM student_profile WHERE parent_email = :pemail", {"pemail": parent_email})
        children = []
        for cr in child_rows:
            sid = cr.get("student_id")
            if sid is None:
                continue
            # build progress for each child by querying quiz_attempt aggregates
            sql = """
                SELECT qa.subject, AVG(qa.score) AS avg_score, AVG(COALESCE(qa.completion_percentage,0)) AS avg_completion
                FROM quiz_attempt qa
                WHERE qa.student_id = :sid
                GROUP BY qa.subject
            """
            rows = safe_execute(db, sql, {"sid": sid})
            scores_map = {r["subject"] or "Unknown": round(float(r["avg_score"] or 0), 2) for r in rows}
            subjects = list(scores_map.keys())
            # overall average & completion
            overall = safe_execute(db, "SELECT AVG(score) AS overall_avg, AVG(COALESCE(completion_percentage,0)) AS overall_completion FROM quiz_attempt WHERE student_id = :sid", {"sid": sid})
            avg = round(float(overall[0].get("overall_avg") or 0), 2) if overall else 0
            completion = round(float(overall[0].get("overall_completion") or 0), 2) if overall else 0
            # best/weak subject
            best = None
            weak = None
            if scores_map:
                best = max(scores_map.items(), key=lambda kv: kv[1])[0]
                weak = min(scores_map.items(), key=lambda kv: kv[1])[0]
            # improvement heuristic: attempt difference
            try:
                imp_rows = safe_execute(db, """
                    SELECT
                      (SELECT AVG(score) FROM quiz_attempt q1 WHERE q1.student_id = :sid AND q1.attempted_at <= (SELECT MIN(attempted_at) FROM quiz_attempt q2 WHERE q2.student_id = :sid)) AS first_avg,
                      (SELECT AVG(score) FROM quiz_attempt q3 WHERE q3.student_id = :sid AND q3.attempted_at >= (SELECT MAX(attempted_at) FROM quiz_attempt q4 WHERE q4.student_id = :sid)) AS last_avg
                """, {"sid": sid})
                improvement = 0
                if imp_rows and (imp_rows[0].get("first_avg") is not None and imp_rows[0].get("last_avg") is not None):
                    improvement = round(float(imp_rows[0]["last_avg"] or 0) - float(imp_rows[0]["first_avg"] or 0), 2)
                else:
                    improvement = 0
            except Exception:
                improvement = 0

            ai_insight = generate_ai_insight(avg, improvement, completion)
            children.append({
                "student_id": sid,
                "child_name": cr.get("student_username") or f"Student {sid}",
                "subjects": subjects,
                "scores": scores_map,
                "average": avg,
                "best_subject": best,
                "weak_subject": weak,
                "completion": completion,
                "improvement": improvement,
                "ai_insight": ai_insight
            })
        return {"parent_email": parent_email, "children": children}
    except Exception as e:
        print("parent_progress exception:", e)
        raise HTTPException(status_code=500, detail="Failed to compute parent progress")


# ---------------------------------------------------------------------
# NEW: Teacher endpoint
# GET /api/dashboard/teacher/progress?class=7
# ---------------------------------------------------------------------
@app.get("/api/dashboard/teacher/progress")
def teacher_progress(class_param: Optional[str] = Query(None, alias="class"), db: Session = Depends(get_db)):
    """
    Returns:
    {
      "className": "Class 7",
      "subjects": [...],
      "subjectAverages": {...},
      "classAverage": 78,
      "top_student": {id,name},
      "bottom_student": {id,name},
      "students": [ {id,name,scores,average,ai_insight}, ... ]
    }
    """
    try:
        class_label = f"Class {class_param}" if class_param else "All Classes"
        params = {}
        class_filter = ""
        if class_param:
            class_filter = "AND qa.class_name = :class_name"
            params["class_name"] = str(class_param)

        # ✅ QUIZ TYPE NORMALIZATION (MAIN FIX)
        quiz_type_filter = """
            AND qa.quiz_type IN (
                'quiz',
                'mock',
                'mock_test',
                'practice',
                'ai_generated'
            )
        """

        # SUBJECT AVERAGES
        subj_sql = f"""
            SELECT qa.subject, AVG(qa.score) AS avg_score
            FROM quiz_attempt qa
            WHERE 1=1
            {quiz_type_filter}
            {class_filter}
            GROUP BY qa.subject
            ORDER BY qa.subject
        """
        subj_rows = safe_execute(db, subj_sql, params)
        subject_averages = {
            r["subject"]: round(float(r["avg_score"] or 0), 2)
            for r in subj_rows if r.get("subject")
        }

        # PER-STUDENT AVERAGES
        student_sql = f"""
            SELECT
                qa.student_id,
                COALESCE(sp.student_username, u.firstname || ' ' || u.lastname, '') AS student_name,
                AVG(qa.score) AS avg_score
            FROM quiz_attempt qa
            LEFT JOIN student_profile sp ON sp.student_id::text = qa.student_id::text
            LEFT JOIN users u ON u.userid::text = qa.student_id::text
            WHERE 1=1
            {quiz_type_filter}
            {class_filter}
            GROUP BY qa.student_id, sp.student_username, u.firstname, u.lastname
            ORDER BY avg_score DESC
        """
        stud_rows = safe_execute(db, student_sql, params)

        students = []
        for r in stud_rows:
            sid = r.get("student_id")
            avg = round(float(r.get("avg_score") or 0), 2)

            subj_scores_rows = safe_execute(
                db,
                """
                SELECT subject, AVG(score) AS avg_score
                FROM quiz_attempt
                WHERE student_id = :sid
                AND quiz_type IN ('quiz','mock','mock_test','practice','ai_generated')
                GROUP BY subject
                """,
                {"sid": sid}
            )

            scores_map = {
                rr["subject"] or "Unknown": round(float(rr["avg_score"] or 0), 2)
                for rr in subj_scores_rows
            }

            ai_insight = generate_ai_insight(avg, 0, 0)

            students.append({
                "id": sid,
                "name": r.get("student_name") or f"Student {sid}",
                "scores": scores_map,
                "average": avg,
                "ai_insight": ai_insight
            })

        class_avg = round(
            sum([s["average"] for s in students]) / len(students), 2
        ) if students else 0.0

        top_student = students[0] if students else None
        bottom_student = students[-1] if students else None

        return {
            "className": class_label,
            "subjects": sorted(subject_averages.keys()) if subject_averages else ["Math", "Science", "English", "Social"],
            "subjectAverages": subject_averages,
            "classAverage": class_avg,
            "top_student": {"id": top_student["id"], "name": top_student["name"]} if top_student else None,
            "bottom_student": {"id": bottom_student["id"], "name": bottom_student["name"]} if bottom_student else None,
            "students": students
        }

    except Exception as e:
        print("teacher_progress exception:", e)
        raise HTTPException(status_code=500, detail="Failed to compute teacher progress")

# ---------------------------------------------------------------------
# NEW: helper endpoint to return list of parents (fixes frontend 404)
# GET /api/dashboard/parents
# ---------------------------------------------------------------------
@app.get("/api/dashboard/parents")
def dashboard_parents(db: Session = Depends(get_db)):
    """
    Returns: { "parents": ["parent1@example.com", "parent2@example.com", ...] }
    This helps the frontend parent dropdown. It derives distinct parent_email from student_profile.
    """
    try:
        rows = safe_execute(db, "SELECT DISTINCT parent_email FROM student_profile WHERE parent_email IS NOT NULL ORDER BY parent_email")
        parents = [r.get("parent_email") for r in rows if r.get("parent_email")]
        return {"parents": parents}
    except Exception as e:
        print("dashboard_parents exception:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch parents list")
# ---------------------------------------------------------------------
# NEW: ROLE-BASED OVERVIEW CHART DATA
# GET /api/dashboard/{role}/overview-chart
# ---------------------------------------------------------------------
@app.get("/api/dashboard/{role}/overview-chart")
def overview_chart(role: str, db: Session = Depends(get_db)):
    """
    Returns role-specific chart data for dashboard overview
    """

    role = role.lower()

    # ---------------- STUDENT ----------------
    if role == "student":
        sql = """
            SELECT class_name, AVG(score) AS avg_score
            FROM quiz_attempt
            GROUP BY class_name
            ORDER BY class_name
        """
        rows = safe_execute(db, sql)
        labels = [r["class_name"] for r in rows]
        data = [round(float(r["avg_score"] or 0), 2) for r in rows]

    # ---------------- PARENT ----------------
    elif role == "parent":
        sql = """
            SELECT qa.subject, AVG(qa.score) AS avg_score
            FROM quiz_attempt qa
            GROUP BY qa.subject
            ORDER BY qa.subject
        """
        rows = safe_execute(db, sql)
        labels = [r["subject"] for r in rows]
        data = [round(float(r["avg_score"] or 0), 2) for r in rows]

    # ---------------- TEACHER ----------------
    elif role == "teacher":
        sql = """
            SELECT class_name, AVG(score) AS avg_score
            FROM quiz_attempt
            GROUP BY class_name
            ORDER BY class_name
        """
        rows = safe_execute(db, sql)
        labels = [r["class_name"] for r in rows]
        data = [round(float(r["avg_score"] or 0), 2) for r in rows]

    else:
        labels = []
        data = []

    return {
        "labels": labels,
        "data": data
    }
