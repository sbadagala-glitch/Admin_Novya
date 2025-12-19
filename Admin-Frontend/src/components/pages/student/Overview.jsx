import React, { useEffect, useState } from "react";
import Overview from "../common/Overview";
import { Card, Row, Col, Badge, Alert } from "react-bootstrap";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

const StudentOverview = () => {
  /* ===========================
     ✅ COMMON OVERVIEW (KEEP)
     =========================== */

  /* ===========================
     🔽 NEW STUDENT STATE
     =========================== */
  const [studentId, setStudentId] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.userid) {
      setStudentId(storedUser.userid);
    } else {
      setLoading(false); // ✅ safety
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      loadStudentProgress();
    }
    // eslint-disable-next-line
  }, [studentId]);

  const loadStudentProgress = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/student/progress?class=7&assessment=mocktest`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();

      const student = data.students?.find(
        (s) => String(s.id) === String(studentId)
      );

      setStudentData(student || null);
      setLoading(false);
    } catch (err) {
      console.error("Student overview load failed", err);
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ COMMON OVERVIEW */}
      <Overview role="student" />

      {/* 🎓 STUDENT-SPECIFIC SECTION */}
      <div className="px-2 px-md-3 mt-4">
        {loading ? (
          <Alert variant="info">Loading your performance...</Alert>
        ) : !studentData ? (
          <Alert variant="warning">No progress data available</Alert>
        ) : (
          <>
            <Row className="g-3 mb-4">
              <Col md={3}>
                <Card className="text-center shadow h-100">
                  <Card.Body>
                    <h6>📊 Average</h6>
                    <h3>{studentData.average}%</h3>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center shadow h-100">
                  <Card.Body>
                    <h6>🏆 Top Subject</h6>
                    <h5>{studentData.topSubject || "-"}</h5>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center shadow h-100">
                  <Card.Body>
                    <h6>📈 Completion</h6>
                    <h3>{studentData.completion}%</h3>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center shadow h-100">
                  <Card.Body>
                    <h6>⚠️ Needs Focus</h6>
                    <h5>
                      {Object.entries(studentData.scores || {})
                        .sort((a, b) => a[1] - b[1])[0]?.[0] || "-"}
                    </h5>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="shadow">
              <Card.Body>
                <h5>🧠 AI Insight</h5>
                <p className="mb-0">
                  {studentData.aiInsight || "No AI insight available yet."}
                </p>
              </Card.Body>
            </Card>
          </>
        )}
      </div>
    </>
  );
};

export default StudentOverview;
