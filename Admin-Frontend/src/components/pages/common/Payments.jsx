import React, { useState, useEffect } from "react";
import { useDashboard } from "../../DashboardContext";

// 👇 keep all your existing imports below this
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
  const { dashboardView } = useDashboard(); // student | parent | teacher

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Filters
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
      filtered = filtered.filter(
        (p) => new Date(p.date) <= new Date(filters.to)
      );

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

  // 🔹 Summary
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const successCount = payments.filter((p) => p.status === "Success").length;
  const pendingCount = payments.filter((p) => p.status === "Pending").length;
  const failedCount = payments.filter((p) => p.status === "Failed").length;
  const successRate = payments.length
    ? Math.round((successCount / payments.length) * 100)
    : 0;

  // 📂 Export
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
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("payments_report.pdf");
    });
    setExportModal(false);
  };

  return (
    <div className="p-2 p-md-3" style={{ minHeight: "100vh" }}>
      {/* Mobile Navbar */}
      {isMobile && (
        <Navbar bg="light" className="mb-3">
          <Navbar.Brand>
            💳 Payments — {dashboardView.toUpperCase()}
          </Navbar.Brand>
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
        </Navbar>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Card className="mb-4">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              📄 Payments & Subscriptions — {dashboardView.toUpperCase()}
            </h3>
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

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}><div style={fadeInDelay(0.1)}><Card><Card.Body>💰 ₹{totalRevenue}</Card.Body></Card></div></Col>
        <Col md={3}><div style={fadeInDelay(0.2)}><Card><Card.Body>✅ {successRate}%</Card.Body></Card></div></Col>
        <Col md={3}><div style={fadeInDelay(0.3)}><Card><Card.Body>🕒 {pendingCount}</Card.Body></Card></div></Col>
        <Col md={3}><div style={fadeInDelay(0.4)}><Card><Card.Body>❌ {failedCount}</Card.Body></Card></div></Col>
      </Row>

      {/* Table */}
      <Card>
        <Card.Body>
          <div id="paymentsTable">
            <Table bordered hover responsive>
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
                {payments.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.transactionId}</td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>{p.class}</td>
                    <td>
                      <Badge bg={p.status === "Success" ? "success" : p.status === "Pending" ? "warning" : "danger"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td>₹{p.amount}</td>
                    <td>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Export Modal */}
      <Modal show={exportModal} centered onHide={() => setExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Export Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button className="w-100 mb-2" onClick={exportToExcel}>
            <FaFileExcel /> Excel
          </Button>
          <Button className="w-100" onClick={exportToPDF}>
            <FaFilePdf /> PDF
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Payments;
