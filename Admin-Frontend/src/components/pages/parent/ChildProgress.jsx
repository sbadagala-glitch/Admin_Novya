import React, { useEffect, useState } from "react";
import { Card, Row, Col, Badge, Alert, Table } from "react-bootstrap";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

const ChildProgress = ({ child }) => {
  if (!child) {
    return (
      <Alert variant="warning">
        Select a child to view progress
      </Alert>
    );
  }

  return (
    <div className="mt-4">
      <Alert variant="info">
        📘 Progress Report — <b>{child.child_name}</b>
      </Alert>

      {/* SUMMARY CARDS */}
      <Row className="g-3 mb-3">
        <Col md={3}>
          <Card className="text-center shadow h-100">
            <Card.Body>
              <h6>Average</h6>
              <h4>{child.average}%</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow h-100">
            <Card.Body>
              <h6>Best Subject</h6>
              <Badge bg="success">{child.best_subject || "—"}</Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow h-100">
            <Card.Body>
              <h6>Weak Subject</h6>
              <Badge bg="danger">{child.weak_subject || "—"}</Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow h-100">
            <Card.Body>
              <h6>Improvement</h6>
              <h4>{child.improvement}%</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* SUBJECT TABLE */}
      <Card className="shadow mb-3">
        <Card.Body>
          <h5>Subject-wise Performance</h5>
          <Table bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(child.scores || {}).map(
                ([subject, score]) => (
                  <tr key={subject}>
                    <td>{subject}</td>
                    <td>
                      <Badge
                        bg={
                          score >= 75
                            ? "success"
                            : score >= 60
                            ? "warning"
                            : "danger"
                        }
                      >
                        {score}%
                      </Badge>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* AI INSIGHT */}
      <Card className="shadow">
        <Card.Body>
          <h5>🤖 AI Insight</h5>
          <p className="mb-0">{child.ai_insight}</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ChildProgress;
