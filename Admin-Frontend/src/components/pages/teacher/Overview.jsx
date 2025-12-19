import React, { useEffect, useState } from "react";
import Overview from "../common/Overview";
import { Card, Row, Col, Alert, Table, Badge } from "react-bootstrap";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

const TeacherOverview = () => {
  const [classParam, setClassParam] = useState("7");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherProgress();
    // eslint-disable-next-line
  }, [classParam]);

  const loadTeacherProgress = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/teacher/progress?class=${classParam}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const result = await res.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <Overview role="teacher" />

      <div className="px-2 px-md-3 mt-4">
        {loading ? (
          <Alert variant="info">Loading class analytics...</Alert>
        ) : !data ? (
          <Alert variant="warning">No analytics data</Alert>
        ) : (
          <>
            <Row className="g-3 mb-4">
              <Col md={3}>
                <Card className="text-center shadow h-100">
                  <Card.Body>
                    <h6>📊 Class Avg</h6>
                    <h3>{data.classAverage}%</h3>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center shadow h-100">
                  <Card.Body>
                    <h6>🏆 Top Student</h6>
                    <h5>{data.top_student?.name || "-"}</h5>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center shadow h-100">
                  <Card.Body>
                    <h6>⚠️ Needs Support</h6>
                    <h5>{data.bottom_student?.name || "-"}</h5>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center shadow h-100">
                  <Card.Body>
                    <h6>Total Students</h6>
                    <h3>{data.students.length}</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="shadow">
              <Card.Body>
                <h5>Student Performance</h5>
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Average</th>
                      <th>Insight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>
                          <Badge bg={s.average >= 75 ? "success" : "warning"}>
                            {s.average}%
                          </Badge>
                        </td>
                        <td>{s.ai_insight}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}
      </div>
    </>
  );
};

export default TeacherOverview;
