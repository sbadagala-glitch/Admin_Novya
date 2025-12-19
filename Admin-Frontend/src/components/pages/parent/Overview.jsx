import React, { useEffect, useState } from "react";
import Overview from "../common/Overview";
import { Card, Row, Col, Table, Badge, Alert, Form } from "react-bootstrap";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

const ParentOverview = () => {
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE_URL}/api/dashboard/parents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) return;

      const data = await res.json();
      setParents(data.parents || []);

      if (data.parents?.length) {
        setSelectedParent(data.parents[0]);
      }
    } catch (err) {
      console.error("Failed to load parents", err);
    }
  };

  useEffect(() => {
    if (selectedParent) {
      loadParentProgress();
    }
    // eslint-disable-next-line
  }, [selectedParent]);

  const loadParentProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/parent/${selectedParent}/progress`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        setChildrenData([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setChildrenData(data.children || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load parent progress", err);
      setLoading(false);
    }
  };

  return (
    <>
      <Overview role="parent" />

      <div className="px-2 px-md-3 mt-4">
        <Card className="mb-4 shadow">
          <Card.Body>
            <Form.Select
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
            >
              {parents.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Form.Select>
          </Card.Body>
        </Card>

        {loading ? (
          <Alert variant="info">Loading children progress...</Alert>
        ) : childrenData.length === 0 ? (
          <Alert variant="warning">No children linked</Alert>
        ) : (
          <>
            <Row className="g-3 mb-4">
              {childrenData.map((child) => (
                <Col md={4} key={child.student_id}>
                  <Card className="shadow h-100">
                    <Card.Body>
                      <h5>👦 {child.child_name}</h5>
                      <p>
                        <b>Average:</b>{" "}
                        <Badge bg={child.average >= 75 ? "success" : "warning"}>
                          {child.average}%
                        </Badge>
                      </p>
                      <p><b>Best:</b> {child.best_subject}</p>
                      <p><b>Weak:</b> {child.weak_subject}</p>
                      <small className="text-muted">{child.ai_insight}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>
    </>
  );
};

export default ParentOverview;
