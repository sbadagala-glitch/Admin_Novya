
import React, { useEffect, useState } from 'react';
import { Table, Card, Container, Row, Col, Badge, Form, Button, Modal, Dropdown } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminAuditTrail = () => {
  const [auditTrail, setAuditTrail] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTrail, setFilteredTrail] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const data = [
      {
        id: 1,
        adminName: "John Doe",
        activity: "Uploaded lesson note: Algebra Basics",
        details: "File: algebra_basics.pdf, Size: 1.2MB",
        timestamp: "2025-07-25 14:22",
        lastLogin: "2025-07-25 13:55",
        ip: "192.168.1.101"
      },
      {
        id: 2,
        adminName: "Alice Smith",
        activity: "Updated quiz scoring for Science",
        details: "Changed pass mark from 50% → 60%",
        timestamp: "2025-07-25 15:01",
        lastLogin: "2025-07-25 14:44",
        ip: "192.168.1.102"
      },
      {
        id: 3,
        adminName: "Ravi Kumar",
        activity: "Added video lesson: Photosynthesis.mp4",
        details: "Duration: 12 mins, Format: MP4",
        timestamp: "2025-07-25 15:30",
        lastLogin: "2025-07-25 15:25",
        ip: "192.168.1.103"
      },
      {
        id: 4,
        adminName: "Meena Patel",
        activity: "Defined answer keys for Physics quiz",
        details: "Added 20 new questions with answers",
        timestamp: "2025-07-25 16:10",
        lastLogin: "2025-07-25 15:58",
        ip: "192.168.1.104"
      },
      {
        id: 5,
        adminName: "Arun Verma",
        activity: "Generated certificates for Grade 10",
        details: "50 student certificates generated (PDF)",
        timestamp: "2025-07-25 16:45",
        lastLogin: "2025-07-25 16:30",
        ip: "192.168.1.105"
      }
    ];
    setAuditTrail(data);
    setFilteredTrail(data);
  }, []);

  useEffect(() => {
    const filtered = auditTrail.filter(item =>
      item.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.activity.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTrail(filtered);
  }, [searchTerm, auditTrail]);

  // 🔹 Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Admin Audit Trail", 14, 10);
    autoTable(doc, {
      head: [['#', 'Admin', 'Activity', 'Timestamp', 'Last Login', 'IP']],
      body: filteredTrail.map((log, index) => [
        index + 1,
        log.adminName,
        log.activity,
        log.timestamp,
        log.lastLogin,
        log.ip
      ]),
    });
    doc.save("audit_trail.pdf");
  };

  // 🔹 Export to CSV
  const exportToCSV = () => {
    const headers = ['#', 'Admin', 'Activity', 'Timestamp', 'Last Login', 'IP'];
    const rows = filteredTrail.map((log, index) =>
      [index + 1, log.adminName, log.activity, log.timestamp, log.lastLogin, log.ip].join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit_trail.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mobile-friendly log card
  const LogCard = ({ log, index }) => (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1">{log.adminName}</h6>
            <small className="text-muted">#{index + 1}</small>
          </div>
          <Badge bg="info">{log.timestamp.split(' ')[0]}</Badge>
        </div>
        
        <div className="mb-2">
          <small><strong>Activity:</strong> {log.activity}</small>
        </div>
        <div className="mb-2">
          <small><strong>Last Login:</strong> {log.lastLogin}</small>
        </div>
        <div className="mb-2">
          <small><strong>IP Address:</strong> {log.ip}</small>
        </div>
        
        <div className="d-flex justify-content-end mt-2">
          <Button
            size="sm"
            variant="info"
            onClick={() => setSelectedLog(log)}
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container style={{ marginTop: '20px', marginBottom: '20px' }}>
      <Row>
        <Col>
          <Card className="shadow p-3">
            <h4>🛡️ Admin Audit Trail</h4>
            <p>Total Logs: <Badge bg="info">{filteredTrail.length}</Badge></p>

            <Form className="mb-3">
              <Form.Control
                type="text"
                placeholder="🔍 Search by admin or activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form>

            <div className="d-flex flex-column flex-md-row gap-2 mb-3">
              <Dropdown>
                <Dropdown.Toggle variant="danger" id="dropdown-pdf" size="sm">
                  Export PDF
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={exportToPDF}>Current View</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-csv" size="sm">
                  Export CSV
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={exportToCSV}>Current View</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {isMobile ? (
              <div>
                {filteredTrail.length > 0 ? (
                  filteredTrail.map((log, index) => (
                    <LogCard key={log.id} log={log} index={index} />
                  ))
                ) : (
                  <div className="text-center py-4">
                    No matching records found.
                  </div>
                )}
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Admin Name</th>
                    <th>Activity</th>
                    <th>Timestamp</th>
                    <th>Last Login</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrail.length > 0 ? (
                    filteredTrail.map((log, index) => (
                      <tr key={log.id}>
                        <td>{index + 1}</td>
                        <td>{log.adminName}</td>
                        <td>{log.activity}</td>
                        <td>{log.timestamp}</td>
                        <td>{log.lastLogin}</td>
                        <td>{log.ip}</td>
                        <td>
                          <Button size="sm" variant="info" onClick={() => setSelectedLog(log)}>View</Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No matching records found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal for Detailed View */}
      <Modal show={!!selectedLog} onHide={() => setSelectedLog(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔎 Log Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <>
              <p><strong>Admin:</strong> {selectedLog.adminName}</p>
              <p><strong>Activity:</strong> {selectedLog.activity}</p>
              <p><strong>Details:</strong> {selectedLog.details}</p>
              <p><strong>Timestamp:</strong> {selectedLog.timestamp}</p>
              <p><strong>Last Login:</strong> {selectedLog.lastLogin}</p>
              <p><strong>IP Address:</strong> {selectedLog.ip}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedLog(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminAuditTrail;