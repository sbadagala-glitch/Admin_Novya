

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Form,
  Row,
  Col,
  Button,
  Badge,
  InputGroup,
  Navbar,
  Nav,
  Collapse,
  Modal,
} from "react-bootstrap";
import {
  FaSearch,
  FaDownload,
  FaFilter,
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// 🔹 Sample Static Data
const sampleData = [
  {
    id: 101,
    transactionId: "TXN123456",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    class: "10th",
    status: "Success",
    date: "2025-07-25",
    amount: 3600,
  },
  {
    id: 102,
    transactionId: "TXN123457",
    email: "priya.sharma@example.com",
    phone: "+91 8765432109",
    class: "8th",
    status: "Pending",
    date: "2025-07-20",
    amount: 3600,
  },
  {
    id: 103,
    transactionId: "TXN123458",
    email: "rahul.singh@example.com",
    phone: "+91 7654321098",
    class: "12th",
    status: "Failed",
    date: "2025-07-22",
    amount: 3600,
  },
  {
    id: 104,
    transactionId: "TXN123459",
    email: "aarav.mehta@example.com",
    phone: "+91 6543210987",
    class: "11th",
    status: "Success",
    date: "2025-07-18",
    amount: 3600,
  },
];

// ✨ Animation Style
const fadeInStyle = {
  opacity: 0,
  transform: "translateY(15px)",
  animation: "fadeInUp 0.6s forwards",
};
const fadeInDelay = (delay) => ({
  ...fadeInStyle,
  animationDelay: `${delay}s`,
});

// Add CSS keyframes dynamically
if (typeof document !== "undefined") {
  const styleSheet = document.styleSheets[0];
  const keyframes = `
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  if (![...styleSheet.cssRules].some((r) => r.name === "fadeInUp")) {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  }
}

const Payments = () => {
  const [payments, setPayments] = useState(sampleData);
  const [filters, setFilters] = useState({
    class: "",
    status: "",
    from: "",
    to: "",
    search: "",
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [exportModal, setExportModal] = useState(false);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Handle Filters
  const handleFilter = () => {
    let filtered = [...sampleData];

    if (filters.class)
      filtered = filtered.filter((p) =>
        p.class.toLowerCase().includes(filters.class.toLowerCase())
      );

    if (filters.status)
      filtered = filtered.filter((p) => p.status === filters.status);

    if (filters.from)
      filtered = filtered.filter(
        (p) => new Date(p.date) >= new Date(filters.from)
      );

    if (filters.to)
      filtered = filtered.filter((p) => new Date(p.date) <= new Date(filters.to));

    if (filters.search)
      filtered = filtered.filter(
        (p) =>
          p.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.phone.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.transactionId
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );

    setPayments(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line
  }, [filters]);

  // 🔹 AI Insights (Summary Stats)
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const successCount = payments.filter((p) => p.status === "Success").length;
  const pendingCount = payments.filter((p) => p.status === "Pending").length;
  const failedCount = payments.filter((p) => p.status === "Failed").length;
  const successRate = payments.length
    ? Math.round((successCount / payments.length) * 100)
    : 0;

  // 📂 Export Functions
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(payments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payments_report.xlsx");
    setExportModal(false);
  };

  const exportToPDF = () => {
    const input = document.getElementById("paymentsTable");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("payments_report.pdf");
    });
    setExportModal(false);
  };

  // Payment card view for mobile
  const renderPaymentCards = () => {
    return payments.map((item, idx) => (
      <Card key={item.id} className="mb-3 payment-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 className="mb-0">{item.email}</h6>
              <small className="text-muted">TXN: {item.transactionId}</small>
            </div>
            <Badge
              bg={
                item.status === "Success"
                  ? "success"
                  : item.status === "Pending"
                  ? "warning"
                  : "danger"
              }
            >
              {item.status}
            </Badge>
          </div>
          
          <Row className="mb-2">
            <Col xs={6}>
              <small>Phone: <strong>{item.phone}</strong></small>
            </Col>
            <Col xs={6}>
              <small>Class: <strong>{item.class}</strong></small>
            </Col>
            <Col xs={6}>
              <small>Amount: <strong>₹{item.amount}</strong></small>
            </Col>
            <Col xs={6}>
              <small>Date: <strong>{item.date}</strong></small>
            </Col>
          </Row>
          
          <div className="text-end">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setExpandedPayment(expandedPayment === item.id ? null : item.id)}
            >
              {expandedPayment === item.id ? <FaChevronUp /> : <FaChevronDown />} Details
            </Button>
          </div>
          
          <Collapse in={expandedPayment === item.id}>
            <div className="mt-2 p-2 bg-light rounded">
              <small>
                <strong>Full Details:</strong><br />
                Transaction ID: {item.transactionId}<br />
                Email: {item.email}<br />
                Phone: {item.phone}<br />
                Class: {item.class}<br />
                Status: {item.status}<br />
                Amount: ₹{item.amount}<br />
                Date: {item.date}
              </small>
            </div>
          </Collapse>
        </Card.Body>
      </Card>
    ));
  };

  // Summary Card Component
  const SummaryCard = ({ title, value, bg }) => (
    <Card className="text-center shadow-sm border-0 h-100 mb-3">
      <Card.Body className="p-3">
        <div className={`p-3 rounded text-white bg-${bg} mb-2`}>
          <h5 className="mb-0">{value}</h5>
        </div>
        <p className="text-muted mb-0">{title}</p>
      </Card.Body>
    </Card>
  );

  return (
    <div className="p-2 p-md-3" style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Mobile Navigation */}
      {isMobile && (
        <Navbar bg="light" expand={false} className="mb-3">
          <Navbar.Brand>💳 Payments</Navbar.Brand>
          <div>
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <FaBars />
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => setExportModal(true)}
            >
              <FaDownload />
            </Button>
          </div>
          <Collapse in={showMobileMenu}>
            <Nav className="flex-column mt-2">
              <InputGroup className="mb-2">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search payments..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </InputGroup>
              <Button 
                variant="outline-info" 
                className="mb-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </Nav>
          </Collapse>
        </Navbar>
      )}

      {/* 🔹 Header */}
      {!isMobile && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <h3 className="text-dark mb-0">📄 Payments & Subscriptions</h3>
            <div>
              <Button variant="outline-success" className="me-2" onClick={exportToExcel}>
                <FaFileExcel /> Excel
              </Button>
              <Button variant="outline-danger" onClick={exportToPDF}>
                <FaFilePdf /> PDF
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* 🔹 AI Summary Cards */}
      <Row className="mb-4">
        <Col xs={6} md={3}>
          <div style={fadeInDelay(0.1)}>
            <SummaryCard
              title="💰 Total Revenue"
              value={`₹${totalRevenue}`}
              bg="primary"
            />
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div style={fadeInDelay(0.2)}>
            <SummaryCard
              title="✅ Success Rate"
              value={`${successRate}%`}
              bg="success"
            />
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div style={fadeInDelay(0.3)}>
            <SummaryCard title="🕒 Pending" value={pendingCount} bg="warning" />
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div style={fadeInDelay(0.4)}>
            <SummaryCard title="❌ Failed" value={failedCount} bg="danger" />
          </div>
        </Col>
      </Row>

      {/* 🔹 Filters */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-dark mb-0">🔍 Filters</h5>
            {isMobile && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <FaChevronUp /> : <FaChevronDown />}
              </Button>
            )}
          </div>
          
          <Collapse in={!isMobile || showFilters}>
            <div>
              <Form>
                <Row className="g-2">
                  <Col md={3} xs={6}>
                    <Form.Control
                      type="text"
                      placeholder="Class"
                      value={filters.class}
                      onChange={(e) =>
                        setFilters({ ...filters, class: e.target.value })
                      }
                      size={isMobile ? "sm" : ""}
                    />
                  </Col>
                  <Col md={2} xs={6}>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      size={isMobile ? "sm" : ""}
                    >
                      <option value="">All Status</option>
                      <option>Success</option>
                      <option>Pending</option>
                      <option>Failed</option>
                    </Form.Select>
                  </Col>
                  <Col md={2} xs={6}>
                    <Form.Control
                      type="date"
                      value={filters.from}
                      onChange={(e) =>
                        setFilters({ ...filters, from: e.target.value })
                      }
                      size={isMobile ? "sm" : ""}
                    />
                  </Col>
                  <Col md={2} xs={6}>
                    <Form.Control
                      type="date"
                      value={filters.to}
                      onChange={(e) =>
                        setFilters({ ...filters, to: e.target.value })
                      }
                      size={isMobile ? "sm" : ""}
                    />
                  </Col>
                  <Col md={1} xs={6}>
                    <Button
                      variant="primary"
                      onClick={handleFilter}
                      className="w-100"
                      size={isMobile ? "sm" : ""}
                    >
                      Go
                    </Button>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={4}>
                    <InputGroup size={isMobile ? "sm" : ""}>
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Search (email, phone, txn ID)"
                        value={filters.search}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value })
                        }
                      />
                    </InputGroup>
                  </Col>
                </Row>
              </Form>
            </div>
          </Collapse>
        </Card.Body>
      </Card>

      {/* 🔹 Payment Table */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="text-dark mb-3">💳 Payment History</h5>
          
          {isMobile ? (
            <div>
              {payments.length === 0 ? (
                <div className="text-center p-4">⚠️ No records found</div>
              ) : (
                renderPaymentCards()
              )}
            </div>
          ) : (
            <div id="paymentsTable">
              <Table responsive hover bordered className="text-center">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Txn ID</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Class</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="8">⚠️ No records found</td>
                    </tr>
                  ) : (
                    payments.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td>{item.transactionId}</td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td>{item.class}</td>
                        <td>
                          <Badge
                            bg={
                              item.status === "Success"
                                ? "success"
                                : item.status === "Pending"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td>₹{item.amount}</td>
                        <td>{item.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Export Modal for Mobile */}
      <Modal show={exportModal} centered onHide={() => setExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Export Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            <Button variant="outline-success" onClick={exportToExcel}>
              <FaFileExcel /> Export to Excel
            </Button>
            <Button variant="outline-danger" onClick={exportToPDF}>
              <FaFilePdf /> Export to PDF
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Payments;