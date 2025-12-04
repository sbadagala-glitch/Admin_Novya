from fastapi import APIRouter, HTTPException, Query
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/admin/progress", tags=["admin-progress"])

# Database connection using asyncpg directly
async def get_db_connection():
    # Get database URL from environment
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:srinu@localhost:5432/novya")
    # Convert to asyncpg format if needed
    db_url = db_url.replace("postgresql+psycopg2://", "postgresql://")
    return await asyncpg.connect(db_url)

@router.get("/class-insights/{class_id}")
async def get_class_insights(class_id: int, assessment_type: str = "mocktest"):
    try:
        conn = await get_db_connection()
        
        if assessment_type == "mocktest":
            query = """
            SELECT 
                sp.student_id,
                sp.student_username as student_name,
                COALESCE(AVG(mta.score), 0) as average_score,
                (SELECT mta2.subject FROM mock_test_attempt mta2 
                 WHERE mta2.student_id = sp.student_id 
                 ORDER BY mta2.score DESC LIMIT 1) as top_subject,
                COALESCE(AVG(mta.completion_percentage), 0) as completion_rate,
                CASE 
                    WHEN AVG(mta.score) >= 90 THEN 'High retention'
                    WHEN AVG(mta.score) >= 80 THEN 'Ready'
                    WHEN AVG(mta.score) >= 70 THEN 'Needs practice'
                    ELSE 'Needs attention'
                END as ai_insight
            FROM student_profile sp
            LEFT JOIN mock_test_attempt mta ON sp.student_id = mta.student_id
            WHERE sp.student_id IN (4,5,6,7)
            GROUP BY sp.student_id, sp.student_username
            ORDER BY average_score DESC
            """
        else:  # quiz
            query = """
            SELECT 
                sp.student_id,
                sp.student_username as student_name,
                COALESCE(AVG(qa.score), 0) as average_score,
                (SELECT qa2.subject FROM quiz_attempt qa2 
                 WHERE qa2.student_id = sp.student_id 
                 ORDER BY qa2.score DESC LIMIT 1) as top_subject,
                COALESCE(AVG(qa.completion_percentage), 0) as completion_rate,
                CASE 
                    WHEN AVG(qa.score) >= 90 THEN 'High retention'
                    WHEN AVG(qa.score) >= 80 THEN 'Ready'
                    WHEN AVG(qa.score) >= 70 THEN 'Needs practice'
                    ELSE 'Needs attention'
                END as ai_insight
            FROM student_profile sp
            LEFT JOIN quiz_attempt qa ON sp.student_id = qa.student_id
            WHERE sp.student_id IN (4,5,6,7)
            GROUP BY sp.student_id, sp.student_username
            ORDER BY average_score DESC
            """
        
        students = await conn.fetch(query)
        await conn.close()
        
        # Convert to list of dictionaries
        student_list = []
        for student in students:
            student_list.append({
                "student_id": student['student_id'],
                "student_name": student['student_name'],
                "average_score": float(student['average_score']) if student['average_score'] else 0.0,
                "top_subject": student['top_subject'] or "No data",
                "completion_rate": float(student['completion_rate']) if student['completion_rate'] else 0.0,
                "ai_insight": student['ai_insight'] or "No data"
            })
        
        # Calculate class averages
        class_averages = {
            "average_main_score": 0,
            "average_science_score": 0,
            "average_discussion_score": 0,
            "average_history_score": 0,
            "overall_average": 0
        }
        
        if student_list:
            avg_score = sum([s['average_score'] for s in student_list]) / len(student_list)
            class_averages["average_main_score"] = round(avg_score, 1)
            class_averages["average_science_score"] = round(avg_score, 1)
            class_averages["average_discussion_score"] = round(avg_score, 1)
            class_averages["average_history_score"] = round(avg_score, 1)
            class_averages["overall_average"] = round(avg_score, 1)
        
        return {
            "class_id": class_id,
            "class_name": f"Class {class_id}",
            **class_averages,
            "students": student_list
        }
        
    except Exception as e:
        return {"error": str(e)}

@router.get("/classes")
async def get_all_classes():
    return [
        {"class_id": 7, "class_name": "Class 7"},
        {"class_id": 8, "class_name": "Class 8"}, 
        {"class_id": 9, "class_name": "Class 9"},
        {"class_id": 10, "class_name": "Class 10"}
    ]

@router.get("/test-connection")
async def test_connection():
    """Test database connection"""
    try:
        conn = await get_db_connection()
        await conn.close()
        return {"status": "success", "message": "Database connected successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/test-tables")
async def test_tables():
    """Test if we can access the tables"""
    try:
        conn = await get_db_connection()
        # Test if student_profile table exists
        students = await conn.fetch("SELECT student_id, student_username FROM student_profile LIMIT 5")
        await conn.close()
        
        student_list = []
        for student in students:
            student_list.append({
                "student_id": student['student_id'],
                "student_username": student['student_username']
            })
            
        return {
            "status": "success", 
            "students": student_list,
            "message": f"Found {len(student_list)} students"
        }
    except Exception as e:
        return {"status": "error", "message": f"Table access error: {str(e)}"}

@router.get("/debug-student-grades")
async def debug_student_grades():
    """Debug endpoint to see student grades and assessment data"""
    try:
        conn = await get_db_connection()
        
        # Check student grades
        students = await conn.fetch("SELECT student_id, student_username, grade FROM student_profile")
        
        # Check mock test attempts
        mock_tests = await conn.fetch("SELECT student_id, score, subject FROM mock_test_attempt LIMIT 10")
        
        # Check quiz attempts  
        quizzes = await conn.fetch("SELECT student_id, score, subject FROM quiz_attempt LIMIT 10")
        
        await conn.close()
        
        return {
            "students": [{"id": s['student_id'], "username": s['student_username'], "grade": s['grade']} for s in students],
            "mock_tests_sample": [{"student_id": m['student_id'], "score": m['score'], "subject": m['subject']} for m in mock_tests],
            "quizzes_sample": [{"student_id": q['student_id'], "score": q['score'], "subject": q['subject']} for q in quizzes]
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/subject-averages/{class_id}")
async def get_subject_averages(class_id: int, assessment_type: str = "mocktest"):
    """Get detailed subject-wise averages for a class"""
    try:
        conn = await get_db_connection()
        
        if assessment_type == "mocktest":
            query = """
            SELECT 
                subject,
                AVG(score) as average_score,
                COUNT(*) as total_tests,
                MAX(score) as highest_score,
                MIN(score) as lowest_score
            FROM mock_test_attempt 
            WHERE student_id IN (4,5,6,7)
            GROUP BY subject
            ORDER BY average_score DESC
            """
        else:
            query = """
            SELECT 
                subject,
                AVG(score) as average_score,
                COUNT(*) as total_quizzes,
                MAX(score) as highest_score,
                MIN(score) as lowest_score
            FROM quiz_attempt 
            WHERE student_id IN (4,5,6,7)
            GROUP BY subject
            ORDER BY average_score DESC
            """
        
        subject_data = await conn.fetch(query)
        await conn.close()
        
        subject_list = []
        for subject in subject_data:
            subject_list.append({
                "subject": subject['subject'],
                "average_score": round(float(subject['average_score'] or 0), 1),
                "total_assessments": subject['total_tests'] if assessment_type == "mocktest" else subject['total_quizzes'],
                "highest_score": round(float(subject['highest_score'] or 0), 1),
                "lowest_score": round(float(subject['lowest_score'] or 0), 1)
            })
        
        return {
            "class_id": class_id,
            "assessment_type": assessment_type,
            "subjects": subject_list
        }
        
    except Exception as e:
        return {"error": str(e)}

@router.get("/student-details/{student_id}")
async def get_student_details(student_id: int):
    """Get detailed progress for a specific student"""
    try:
        conn = await get_db_connection()
        
        # Get student basic info
        student_info = await conn.fetchrow(
            "SELECT student_id, student_username, grade, school FROM student_profile WHERE student_id = $1", 
            student_id
        )
        
        if not student_info:
            await conn.close()
            return {"error": "Student not found"}
        
        # Get mock test stats
        mock_stats = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total_tests,
                AVG(score) as average_score,
                MAX(score) as best_score,
                MIN(score) as worst_score
            FROM mock_test_attempt 
            WHERE student_id = $1
        """, student_id)
        
        # Get quiz stats
        quiz_stats = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total_quizzes,
                AVG(score) as average_score,
                MAX(score) as best_score,
                MIN(score) as worst_score
            FROM quiz_attempt 
            WHERE student_id = $1
        """, student_id)
        
        # Get subject performance
        subject_performance = await conn.fetch("""
            SELECT 
                subject,
                AVG(score) as average_score,
                COUNT(*) as attempt_count
            FROM (
                SELECT student_id, subject, score FROM mock_test_attempt 
                UNION ALL 
                SELECT student_id, subject, score FROM quiz_attempt
            ) combined
            WHERE student_id = $1
            GROUP BY subject
            ORDER BY average_score DESC
        """, student_id)
        
        await conn.close()
        
        return {
            "student_info": {
                "student_id": student_info['student_id'],
                "username": student_info['student_username'],
                "grade": student_info['grade'],
                "school": student_info['school']
            },
            "mock_test_stats": {
                "total_tests": mock_stats['total_tests'] if mock_stats else 0,
                "average_score": round(float(mock_stats['average_score'] or 0), 1),
                "best_score": round(float(mock_stats['best_score'] or 0), 1),
                "worst_score": round(float(mock_stats['worst_score'] or 0), 1)
            },
            "quiz_stats": {
                "total_quizzes": quiz_stats['total_quizzes'] if quiz_stats else 0,
                "average_score": round(float(quiz_stats['average_score'] or 0), 1),
                "best_score": round(float(quiz_stats['best_score'] or 0), 1),
                "worst_score": round(float(quiz_stats['worst_score'] or 0), 1)
            },
            "subject_performance": [
                {
                    "subject": sub['subject'],
                    "average_score": round(float(sub['average_score'] or 0), 1),
                    "attempt_count": sub['attempt_count']
                } for sub in subject_performance
            ]
        }
        
    except Exception as e:
        return {"error": str(e)}