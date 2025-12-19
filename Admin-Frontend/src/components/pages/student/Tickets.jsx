// src/components/pages/Tickets.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Badge, 
  Button, 
  Form, 
  Alert,
  Row,
  Col,
} from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { v4 as uuidv4 } from 'uuid';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [parentTickets, setParentTickets] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [studentEnquiries, setStudentEnquiries] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [activeTab, setActiveTab] = useState('support');

  const API_BASE_FASTAPI = process.env.REACT_APP_API_URL || "http://localhost:8000";
  const API_BASE_DJANGO = process.env.REACT_APP_DJANGO_URL || "http://localhost:8001";

  // Helper: fetch with auth token
  const fetchWithAuth = (url, opts = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = Object.assign({}, opts.headers || {});
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, Object.assign({}, opts, { headers }));
  };

  useEffect(() => {
    let mounted = true;

    // 1) DJANGO contact requests (still public)
    fetch(`${API_BASE_DJANGO}/api/core/contact/list/`)
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        if (Array.isArray(data)) setContactRequests(data);
      })
      .catch(err => console.error("Error fetching contact requests:", err));

    // 2) Parent contact requests (FastAPI) — use auth, fallback to localStorage only on failure
    const loadParentContacts = async () => {
      const local = localStorage.getItem('parentTickets');
      try {
        const res = await fetchWithAuth(`${API_BASE_FASTAPI}/api/core/parent/contact/list/`, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map((item) => ({
              id: item.id ?? uuidv4(),
              parentName: item.parent_name,
              studentName: item.student_name,
              studentId: item.student_id,
              email: item.email,
              phone: item.phone_number,
              message: item.message,
              status: item.status || "pending",
              createdAt: item.created_at || item.createdAt || new Date().toISOString()
            }));
            setParentTickets(mapped);
            try { localStorage.setItem("parentTickets", JSON.stringify(mapped)); } catch(_) {}
            return;
          }
        }
        // fallback: use saved local
        if (local && !parentTickets.length) {
          setParentTickets(JSON.parse(local));
        }
      } catch (err) {
        console.error("Error fetching parent contact list:", err);
        if (local && !parentTickets.length) {
          try { setParentTickets(JSON.parse(local)); } catch(_) {}
        }
      }
    };

    // 3) Student enquiries (FastAPI) — use auth and fallback to empty list
    const loadStudentEnquiries = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE_FASTAPI}/api/student-enquiries`, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // ensure fields exist and stable ids
            const mapped = data.map((item) => ({
              id: item.id ?? uuidv4(),
              studentId: item.student_id,
              name: item.name || item.student_name || "Student",
              email: item.email || "",
              main_issue: item.main_issue || item.issue || item.issue_text || "",
              status: item.status || "New Request",
              created_at: item.created_at || item.createdAt || new Date().toISOString()
            }));
            setStudentEnquiries(mapped);
            return;
          }
        }
        // fallback empty (do not overwrite with stale)
        setStudentEnquiries((prev) => prev || []);
      } catch (err) {
        console.error("Error fetching student enquiries:", err);
        setStudentEnquiries((prev) => prev || []);
      }
    };

    // 4) Local tickets (client-side) — use local storage as primary for user-created tickets
    try {
      const dataLocal = localStorage.getItem('tickets');
      if (dataLocal && !tickets.length) setTickets(JSON.parse(dataLocal));
    } catch (e) {}

    loadParentContacts();
    loadStudentEnquiries();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveTickets = (data) => {
    setTickets(data);
    try { localStorage.setItem('tickets', JSON.stringify(data)); } catch(_) {}
  };

  const saveParentTickets = (data) => {
    setParentTickets(data);
    try { localStorage.setItem('parentTickets', JSON.stringify(data)); } catch(_) {}
  };

  const getSlaBadge = (slaDeadline) => {
    if (!slaDeadline) return <Badge bg="secondary">-</Badge>;
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const diffHours = (deadline - now) / (1000 * 60 * 60);

    if (diffHours < 0) return <Badge bg="danger">❌ Breached</Badge>;
    if (diffHours < 12) return <Badge bg="warning">⏳ Urgent</Badge>;
    if (diffHours < 24) return <Badge bg="info">⚠️ Due Soon</Badge>;
    return <Badge bg="success">✅ On Track</Badge>;
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    switch(status.toLowerCase()) {
      case 'open': return <Badge bg="primary">Open</Badge>;
      case 'in progress': return <Badge bg="warning">In Progress</Badge>;
      case 'resolved': return <Badge bg="success">Resolved</Badge>;
      case 'approved': return <Badge bg="success">Approved</Badge>;
      case 'rejected': return <Badge bg="danger">Rejected</Badge>;
      case 'pending': return <Badge bg="secondary">Pending</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    String(ticket.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticket.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticket.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticket.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticket.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParentTickets = parentTickets.filter((ticket) =>
    String(ticket.parentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticket.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticket.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticket.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(ticket.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudentEnquiries = studentEnquiries.filter((entry) =>
    String(entry.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(entry.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(entry.main_issue || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(entry.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(entry.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      <div className="text-center mb-4">
        <h2 style={{ fontWeight: 'bold', color: '#2D5D7B' }}>🎟️ Support System</h2>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} className="mb-3" onClose={() => setAlert({ show: false })} dismissible>
          {alert.message}
        </Alert>
      )}

      {/* ---------------- TABS ---------------- */}
      <Card className="mb-3">
        <Card.Body className="p-2">
          <div className="d-flex justify-content-center">
            <Button 
              variant={activeTab === 'support' ? 'primary' : 'outline-primary'} 
              className="me-2"
              onClick={() => setActiveTab('support')}
            >
              Support Tickets
            </Button>

            <Button 
              variant={activeTab === 'parent' ? 'primary' : 'outline-primary'} 
              className="me-2"
              onClick={() => setActiveTab('parent')}
            >
              Parent Inquiries
            </Button>

            <Button 
              variant={activeTab === 'student' ? 'primary' : 'outline-primary'} 
              onClick={() => setActiveTab('student')}
            >
              Student Enquiries
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col>
          <Card className="mb-3">
            <Card.Body>
              <Form.Control
                type="text"
                placeholder="🔍 Search by ID, name, email or status"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Card.Body>
          </Card>

          {/* ---------------- SUPPORT TICKETS ---------------- */}
          {activeTab === 'support' && (
            <Card>
              <Card.Header>
                <strong>Support Tickets</strong>
              </Card.Header>

              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Type</th>
                      <th>SLA / Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id ?? ticket._fallbackId}>
                        <td>{ticket.id}</td>
                        <td>{ticket.user}</td>
                        <td>{ticket.email}</td>
                        <td>{getStatusBadge(ticket.status)}</td>
                        <td>{ticket.type}</td>
                        <td>{getSlaBadge(ticket.slaDeadline)}</td>
                      </tr>
                    ))}

                    {contactRequests.map((req) => (
                      <tr key={`contact-${req.id}`} style={{ background: '#f0f7ff' }}>
                        <td>{req.id}</td>
                        <td>{req.full_name}</td>
                        <td>{req.email}</td>
                        <td><Badge bg="info">New Request</Badge></td>
                        <td>{req.help_topic}</td>
                        <td>{new Date(req.created_at).toLocaleString()}</td>
                      </tr>
                    ))}

                    {filteredTickets.length === 0 && contactRequests.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center p-3">No support tickets found.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* ---------------- PARENT INQUIRIES ---------------- */}
          {activeTab === 'parent' && (
            <Card>
              <Card.Header><strong>Parent Inquiries</strong></Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Parent Name</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredParentTickets.map((ticket) => (
                      <tr key={ticket.id ?? ticket._fallbackId}>
                        <td>{ticket.id}</td>
                        <td>{ticket.parentName}</td>
                        <td>{ticket.studentName}</td>
                        <td>{ticket.email}</td>
                        <td>{getStatusBadge(ticket.status)}</td>
                        <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}

                    {filteredParentTickets.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center p-3">No parent inquiries found.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* ---------------- ⭐ STUDENT ENQUIRIES ---------------- */}
          {activeTab === 'student' && (
            <Card>
              <Card.Header><strong>Student Enquiries</strong></Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Main Issue</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudentEnquiries.map((entry) => (
                      <tr key={entry.id ?? entry._fallbackId}>
                        <td>{entry.id}</td>
                        <td>{entry.name}</td>
                        <td>{entry.email}</td>
                        <td style={{ maxWidth: 300, whiteSpace: 'normal' }}>{entry.main_issue}</td>
                        <td>{getStatusBadge(entry.status)}</td>
                        <td>{new Date(entry.created_at).toLocaleString()}</td>
                      </tr>
                    ))}

                    {filteredStudentEnquiries.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center p-3">No student enquiries found.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

        </Col>
      </Row>
    </div>
  );
};

export default Tickets;
