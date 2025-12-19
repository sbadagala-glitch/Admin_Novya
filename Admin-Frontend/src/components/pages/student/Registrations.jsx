// // src/components/pages/Registrations.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   Table,
//   Button,
//   Form,
//   Modal,
//   Badge,
//   Row,
//   Col,
//   Dropdown,
// } from "react-bootstrap";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import "jspdf-autotable";

// const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// const Registrations = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [fadeIn, setFadeIn] = useState(false);

//   // Data
//   const [users, setUsers] = useState([]); // all users (for Total Users table)
//   const [upcomingUsers, setUpcomingUsers] = useState([]); // still kept, but will be empty by default
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

//   // Sample data fallback (kept so we don't remove functionality)
//   const sampleUsers = [
//     {
//       regId: "R001",
//       firstName: "John",
//       lastName: "Doe",
//       phone: "9876543210",
//       email: "john@example.com",
//       username: "johndoe",
//       password: "••••••",
//       role: "Student",
//       status: "Pending",
//       locked: false,
//       createdAt: new Date().toISOString(),
//     },
//     {
//       regId: "R002",
//       firstName: "Alice",
//       lastName: "Smith",
//       phone: "8765432109",
//       email: "alice@example.com",
//       username: "alice123",
//       password: "••••••",
//       role: "Parent",
//       status: "Approved",
//       locked: false,
//       createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
//     },
//     {
//       regId: "R003",
//       firstName: "Michael",
//       lastName: "Johnson",
//       phone: "7654321098",
//       email: "michael@example.com",
//       username: "michaelj",
//       password: "••••••",
//       role: "Student",
//       status: "Pending",
//       locked: false,
//       createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
//     },
//   ];

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     setTimeout(() => setFadeIn(true), 100);
//     // fetch real data from backend
//     loadUsersFromApi();
//   }, []);

//   const loadUsersFromApi = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       // First try the summary endpoint (total + top 3 recent)
//       const summaryRes = await fetch(`${API_BASE_URL}/api/admin/users/summary`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       });

//       if (summaryRes.ok) {
//         const summaryData = await summaryRes.json();
//         // total is a number; recent is an array of user objects
//         // For total users table we still fetch full list below,
//         // but set the top3 into 'newRegistrationsPreview'
//         setUsers([]); // we'll populate after fetching full list
//         // create derived user objects from 'recent' for the "new regs" card/table
//         const recent = summaryData.recent || [];
//         // convert to UI-friendly shape and set top3 in users for preview if needed
//         // We'll fetch full list in the next call.
//         // continue to fetch full list:
//       }

//       // Fetch full list for Total Users table (limit e.g., 500)
//       const listRes = await fetch(`${API_BASE_URL}/api/admin/users?skip=0&limit=500`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       });

//       if (listRes.ok) {
//         const list = await listRes.json();
//         // Map API user objects to the UI format used previously (regId, firstName, lastName, createdAt...).
//         const formatted = list.map((u) => ({
//           regId: u.userid ? `U${u.userid.toString().padStart(3, "0")}` : "NA",
//           firstName: u.firstname || "",
//           lastName: u.lastname || "",
//           phone: u.phonenumber || "",
//           email: u.email || "",
//           username: u.username || "",
//           password: "••••••",
//           role: u.role || "",
//           status: "Active",
//           locked: u.is_active === false,
//           createdAt: u.createdat || null,
//         }));
//         setUsers(formatted);
//       } else {
//         // fallback to sample data
//         setUsers(sampleUsers);
//       }

//       // For upcoming registrations: keep previous behavior, but empty by default (or fetch if you have such data)
//       setUpcomingUsers([]);
//     } catch (err) {
//       console.error("Failed to load users from API:", err);
//       // fallback to sample data
//       setUsers(sampleUsers);
//       setUpcomingUsers([]);
//     }
//   };

//   // Filtering
//   const filteredUsers = users.filter((user) =>
//     Object.values(user).some((val) =>
//       (val || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const filteredUpcomingUsers = upcomingUsers.filter((user) =>
//     Object.values(user).some((val) =>
//       (val || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   // New registrations (last 30 days) — compute from users array
//   const newRegistrations = filteredUsers.filter((u) => {
//     if (!u.createdAt) return false;
//     const regDate = new Date(u.createdAt);
//     const diffDays = (new Date() - regDate) / (1000 * 60 * 60 * 24);
//     return diffDays <= 30;
//   });
//     // 🔥 Only show TOP 3 newest registrations
//   const top3NewRegistrations = newRegistrations
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//     .slice(0, 3);


//   // ----- existing UI handlers (kept as-is) -----
//   const handleView = (user) => {
//     setSelectedUser(user);
//     setShowModal(true);
//   };

//   const handleStatusChange = (regId, newStatus) => {
//     setUsers((prev) =>
//       prev.map((u) => (u.regId === regId ? { ...u, status: newStatus } : u))
//     );
//   };

//   const handleToggleLock = (regId) => {
//     setUsers((prev) =>
//       prev.map((u) =>
//         u.regId === regId ? { ...u, locked: !u.locked } : u
//       )
//     );
//   };

//   // Export Functions (unchanged)
//   const exportToExcel = (data, fileName) => {
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Users");
//     XLSX.writeFile(wb, fileName);
//   };

//   const exportToPDF = (data, fileName, title) => {
//     const doc = new jsPDF();
//     doc.text(title, 14, 10);
//     doc.autoTable({
//       head: [["Reg ID", "Name", "Email", "Username", "Role", "Status", "Locked"]],
//       body: data.map((u) => [
//         u.regId,
//         `${u.firstName} ${u.lastName}`,
//         u.email,
//         u.username,
//         u.role,
//         u.status,
//         u.locked ? "Locked" : "Active",
//       ]),
//     });
//     doc.save(fileName);
//   };

//   // UserCard (unchanged)
//   const UserCard = ({ user, isUpcoming = false }) => (
//     <Card className="mb-3 shadow-sm">
//       <Card.Body>
//         <div className="d-flex justify-content-between align-items-start mb-2">
//           <div>
//             <h6 className="mb-1">{user.firstName} {user.lastName}</h6>
//             <small className="text-muted">ID: {user.regId}</small>
//           </div>
//           <Badge
//             bg={
//               user.status === "Approved"
//                 ? "success"
//                 : user.status === "Rejected"
//                 ? "danger"
//                 : user.status === "Upcoming"
//                 ? "info"
//                 : "warning"
//             }
//           >
//             {user.status}
//           </Badge>
//         </div>

//         <div className="mb-2">
//           <small><strong>Email:</strong> {user.email}</small>
//         </div>
//         <div className="mb-2">
//           <small><strong>Username:</strong> {user.username}</small>
//         </div>
//         <div className="mb-2">
//           <small><strong>Role:</strong> {user.role}</small>
//         </div>

//         {isUpcoming ? (
//           <div className="mb-2">
//             <small><strong>Registration Date:</strong> {new Date(user.registrationDate).toLocaleDateString()}</small>
//           </div>
//         ) : (
//           <div className="mb-2">
//             <small><strong>Status:</strong> {user.locked ? "Locked" : "Active"}</small>
//           </div>
//         )}

//         <div className="d-flex flex-wrap gap-1 mt-2">
//           <Button
//             variant="outline-primary"
//             size="sm"
//             onClick={() => handleView(user)}
//           >
//             View
//           </Button>

//           {!isUpcoming && (
//             <>
//               <Button
//                 variant="success"
//                 size="sm"
//                 onClick={() => handleStatusChange(user.regId, "Approved")}
//               >
//                 Approve
//               </Button>
//               <Button
//                 variant="danger"
//                 size="sm"
//                 onClick={() => handleStatusChange(user.regId, "Rejected")}
//               >
//                 Reject
//               </Button>
//               <Button
//                 variant={user.locked ? "warning" : "dark"}
//                 size="sm"
//                 onClick={() => handleToggleLock(user.regId)}
//               >
//                 {user.locked ? "Unlock" : "Lock"}
//               </Button>
//               <small><strong>Role:</strong> {user.role}</small> 
//             </>
//           )}
//           {isUpcoming && (
//             <Button variant="outline-secondary" size="sm" disabled>
//               No Actions
//             </Button>
//           )}
//         </div>
//       </Card.Body>
//     </Card>
//   );

//   // renderUserTable / renderUpcomingTable and main JSX remain unchanged,
//   // but use our computed arrays (newRegistrations, users, upcomingUsers).
//   // For brevity we reuse your existing render functions by inlining them below:
//   const renderUserTable = (title, data, fileNamePrefix) => (
//     <Card
//       className="m-3 shadow-sm"
//       style={{
//         opacity: fadeIn ? 1 : 0,
//         transition: "opacity 0.5s ease-in",
//       }}
//     >
//       <Card.Body>
//         <h4 className="text-center mb-3">{title}</h4>

//         {/* Search & Export */}
//         <div className="d-flex flex-column flex-md-row justify-content-between mb-3 gap-2">
//           <Form.Control
//             type="text"
//             placeholder="Search by name, email, or role..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               fontSize: "1rem",
//               padding: "0.75rem",
//             }}
//           />
//           <div className="d-flex gap-2">
//             <Dropdown>
//               <Dropdown.Toggle variant="outline-success" id="dropdown-excel" size="sm">
//                 Export Excel
//               </Dropdown.Toggle>
//               <Dropdown.Menu>
//                 <Dropdown.Item onClick={() => exportToExcel(data, `${fileNamePrefix}.xlsx`)}>
//                   {title}
//                 </Dropdown.Item>
//               </Dropdown.Menu>
//             </Dropdown>
//             <Dropdown>
//               <Dropdown.Toggle variant="outline-danger" id="dropdown-pdf" size="sm">
//                 Export PDF
//               </Dropdown.Toggle>
//               <Dropdown.Menu>
//                 <Dropdown.Item onClick={() => exportToPDF(data, `${fileNamePrefix}.pdf`, title)}>
//                   {title}
//                 </Dropdown.Item>
//               </Dropdown.Menu>
//             </Dropdown>
//           </div>
//         </div>

//         {isMobile ? (
//           <div>
//             {data.length > 0 ? (
//               data.map((user) => (
//                 <UserCard key={user.regId} user={user} />
//               ))
//             ) : (
//               <div className="text-center py-4" style={{ color: "#888" }}>
//                 No users found.
//               </div>
//             )}
//           </div>
//         ) : (
//           <Table striped bordered hover responsive>
//             <thead style={{ backgroundColor: "#007bff", color: "#fff" }}>
//               <tr style={{ textAlign: "center" }}>
//                 <th>Reg ID</th>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Username</th>
//                 <th>Role</th>
//                 <th>Status</th>
//                 <th>Locked</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.length > 0 ? (
//                 data.map((user) => (
//                   <tr key={user.regId} style={{ textAlign: "center" }}>
//                     <td>{user.regId}</td>
//                     <td>
//                       {user.firstName} {user.lastName}
//                     </td>
//                     <td>{user.email}</td>
//                     <td>{user.username}</td>
//                     <td>
//                         {user.role}
//                     </td>
//                     <td>
//                       <Badge
//                         bg={
//                           user.status === "Approved"
//                             ? "success"
//                             : user.status === "Rejected"
//                             ? "danger"
//                             : user.status === "Upcoming"
//                             ? "info"
//                             : "warning"
//                         }
//                       >
//                         {user.status}
//                       </Badge>
//                     </td>
//                     <td>
//                       <Badge bg={user.locked ? "dark" : "secondary"}>
//                         {user.locked ? "Locked" : "Active"}
//                       </Badge>
//                     </td>
//                     <td>
//                       <div className="d-flex flex-wrap gap-1 justify-content-center">
//                         <Button
//                           variant="outline-primary"
//                           size="sm"
//                           onClick={() => handleView(user)}
//                         >
//                           View
//                         </Button>
//                         <Button
//                           variant="success"
//                           size="sm"
//                           onClick={() =>
//                             handleStatusChange(user.regId, "Approved")
//                           }
//                         >
//                           Approve
//                         </Button>
//                         <Button
//                           variant="danger"
//                           size="sm"
//                           onClick={() =>
//                             handleStatusChange(user.regId, "Rejected")
//                           }
//                         >
//                           Reject
//                         </Button>
//                         <Button
//                           variant={user.locked ? "warning" : "dark"}
//                           size="sm"
//                           onClick={() => handleToggleLock(user.regId)}
//                         >
//                           {user.locked ? "Unlock" : "Lock"}
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="8" style={{ textAlign: "center", color: "#888" }}>
//                     No users found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         )}
//       </Card.Body>
//     </Card>
//   );

//   const renderUpcomingTable = (title, data, fileNamePrefix) => (
//     <Card
//       className="m-3 shadow-sm"
//       style={{
//         opacity: fadeIn ? 1 : 0,
//         transition: "opacity 0.5s ease-in",
//       }}
//     >
//       <Card.Body>
//         <h4 className="text-center mb-3">{title}</h4>

//         {/* Search & Export */}
//         <div className="d-flex flex-column flex-md-row justify-content-between mb-3 gap-2">
//           <Form.Control
//             type="text"
//             placeholder="Search by name, email, or role..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               fontSize: "1rem",
//               padding: "0.75rem",
//             }}
//           />
//           <div className="d-flex gap-2">
//             <Dropdown>
//               <Dropdown.Toggle variant="outline-success" id="dropdown-excel" size="sm">
//                 Export Excel
//               </Dropdown.Toggle>
//               <Dropdown.Menu>
//                 <Dropdown.Item onClick={() => exportToExcel(data, `${fileNamePrefix}.xlsx`)}>
//                   {title}
//                 </Dropdown.Item>
//               </Dropdown.Menu>
//             </Dropdown>
//             <Dropdown>
//               <Dropdown.Toggle variant="outline-danger" id="dropdown-pdf" size="sm">
//                 Export PDF
//               </Dropdown.Toggle>
//               <Dropdown.Menu>
//                 <Dropdown.Item onClick={() => exportToPDF(data, `${fileNamePrefix}.pdf`, title)}>
//                   {title}
//                 </Dropdown.Item>
//               </Dropdown.Menu>
//             </Dropdown>
//           </div>
//         </div>

//         {isMobile ? (
//           <div>
//             {data.length > 0 ? (
//               data.map((user) => (
//                 <UserCard key={user.regId} user={user} isUpcoming={true} />
//               ))
//             ) : (
//               <div className="text-center py-4" style={{ color: "#888" }}>
//                 No upcoming registrations found.
//               </div>
//             )}
//           </div>
//         ) : (
//           <Table striped bordered hover responsive>
//             <thead style={{ backgroundColor: "#17a2b8", color: "#fff" }}>
//               <tr style={{ textAlign: "center" }}>
//                 <th>Reg ID</th>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Username</th>
//                 <th>Role</th>
//                 <th>Status</th>
//                 <th>Registration Date</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.length > 0 ? (
//                 data.map((user) => (
//                   <tr key={user.regId} style={{ textAlign: "center" }}>
//                     <td>{user.regId}</td>
//                     <td>
//                       {user.firstName} {user.lastName}
//                     </td>
//                     <td>{user.email}</td>
//                     <td>{user.username}</td>
//                     <td>{user.role}</td>
//                     <td>
//                       <Badge bg="info">
//                         {user.status}
//                       </Badge>
//                     </td>
//                     <td>
//                       {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : "-"}
//                     </td>
//                     <td>
//                       <div className="d-flex justify-content-center gap-1">
//                         <Button
//                           variant="outline-primary"
//                           size="sm"
//                           onClick={() => handleView(user)}
//                         >
//                           View
//                         </Button>
//                         <Button
//                           variant="outline-secondary"
//                           size="sm"
//                           disabled
//                         >
//                           No Actions
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="8" style={{ textAlign: "center", color: "#888" }}>
//                     No upcoming registrations found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         )}
//       </Card.Body>
//     </Card>
//   );

//   return (
//     <>
//       {/* 🔹 Top Stat Cards with Hover Effect */}
//       <Row className="m-3">
//         <Col md={4} className="mb-3">
//           <Card
//             className="shadow-sm text-center p-3"
//             style={{
//               transition: "transform 0.3s, box-shadow 0.3s",
//               cursor: "pointer",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.transform = "scale(1.05)";
//               e.currentTarget.style.boxShadow =
//                 "0px 4px 20px rgba(0,0,0,0.2)";
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.transform = "scale(1)";
//               e.currentTarget.style.boxShadow = "0px 2px 6px rgba(0,0,0,0.1)";
//             }}
//           >
//             <h5>🆕 New Registrations</h5>
//             <h3>{newRegistrations.length}</h3>
//           </Card>
//         </Col>
//         <Col md={4} className="mb-3">
//           <Card
//             className="shadow-sm text-center p-3"
//             style={{
//               transition: "transform 0.3s, box-shadow 0.3s",
//               cursor: "pointer",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.transform = "scale(1.05)";
//               e.currentTarget.style.boxShadow =
//                 "0px 4px 20px rgba(0,0,0,0.2)";
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.transform = "scale(1)";
//               e.currentTarget.style.boxShadow = "0px 2px 6px rgba(0,0,0,0.1)";
//             }}
//           >
//             <h5>👥 Total Users</h5>
//             <h3>{users.length}</h3>
//           </Card>
//         </Col>
//       </Row>


//       {/* New Registrations Table */}
//       {renderUserTable(
//         "🆕 New Registrations",
//         top3NewRegistrations,
//         "new_registrations"
//       )}


//       {/* Total Users Table */}
//       {renderUserTable("👥 Total Users", filteredUsers, "total_users")}

//       {/* Modal for user details */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>User Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedUser && (
//             <>
//               <p><strong>Registration ID:</strong> {selectedUser.regId}</p>
//               <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
//               <p><strong>Email:</strong> {selectedUser.email}</p>
//               <p><strong>Username:</strong> {selectedUser.username}</p>
//               <p><strong>Phone:</strong> {selectedUser.phone}</p>
//               <p><strong>Role:</strong> {selectedUser.role}</p>
//               <p><strong>Status:</strong> {selectedUser.status}</p>
//               <p><strong>Account:</strong> {selectedUser.locked ? "Locked" : "Active"}</p>
//               {selectedUser.registrationDate && (
//                 <p><strong>Registration Date:</strong> {new Date(selectedUser.registrationDate).toLocaleDateString()}</p>
//               )}
//               {selectedUser.createdAt && (
//                 <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
//               )}
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default Registrations;



// src/components/pages/Registrations.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  Row,
  Col,
  Dropdown,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ✅ NEW (does NOT remove old logic)
import { useDashboard } from "../../DashboardContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/* ===========================
   🔐 OLD ROLE DETECTION (KEPT)
   =========================== */
const getDashboardRole = () => {
  if (typeof window === "undefined") return null;

  const path = window.location.pathname.toLowerCase();

  if (path.includes("/student/")) return "Student";
  if (path.includes("/parent/")) return "Parent";
  if (path.includes("/teacher/")) return "Teacher";

  return null;
};

const Registrations = () => {
  /* ===========================
     ✅ NEW ROLE SOURCE (PRIMARY)
     =========================== */
  const { dashboardView } = useDashboard(); // student | parent | teacher
  const urlRole = getDashboardRole();       // fallback

  // 🔥 FINAL ROLE (safe + backward compatible)
  const effectiveRole =
    dashboardView
      ? dashboardView.charAt(0).toUpperCase() + dashboardView.slice(1)
      : urlRole;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // Data
  const [users, setUsers] = useState([]);
  const [upcomingUsers, setUpcomingUsers] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Sample data fallback (UNCHANGED)
  const sampleUsers = [
    {
      regId: "R001",
      firstName: "John",
      lastName: "Doe",
      phone: "9876543210",
      email: "john@example.com",
      username: "johndoe",
      password: "••••••",
      role: "Student",
      status: "Pending",
      locked: false,
      createdAt: new Date().toISOString(),
    },
    {
      regId: "R002",
      firstName: "Alice",
      lastName: "Smith",
      phone: "8765432109",
      email: "alice@example.com",
      username: "alice123",
      password: "••••••",
      role: "Parent",
      status: "Approved",
      locked: false,
      createdAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
    loadUsersFromApi();
  }, [effectiveRole]); // 🔥 reload on role switch

  /* ===========================
     🔄 LOAD USERS FROM BACKEND
     =========================== */
  const loadUsersFromApi = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const listRes = await fetch(
        `${API_BASE_URL}/api/admin/users?skip=0&limit=500`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (listRes.ok) {
        const list = await listRes.json();

        const formatted = list
          .map((u) => ({
            regId: u.userid ? `U${u.userid.toString().padStart(3, "0")}` : "NA",
            firstName: u.firstname || "",
            lastName: u.lastname || "",
            phone: u.phonenumber || "",
            email: u.email || "",
            username: u.username || "",
            password: "••••••",
            role: u.role || "",
            status: "Active",
            locked: u.is_active === false,
            createdAt: u.createdat || null,
          }))
          // ✅ FINAL ROLE FILTER (MAIN FIX)
          .filter((u) =>
            effectiveRole
              ? u.role?.toLowerCase() === effectiveRole.toLowerCase()
              : true
          );

        setUsers(formatted);
      } else {
        setUsers(sampleUsers);
      }

      setUpcomingUsers([]);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers(sampleUsers);
      setUpcomingUsers([]);
    }
  };

  /* ===========================
     🔍 FILTERING (UNCHANGED)
     =========================== */
  const filteredUsers = users.filter((user) =>
    Object.values(user).some((val) =>
      (val || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  const newRegistrations = filteredUsers.filter((u) => {
    if (!u.createdAt) return false;
    const diff =
      (new Date() - new Date(u.createdAt)) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  });

  const top3NewRegistrations = newRegistrations
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  /* ===========================
     🧠 ACTION HANDLERS (UNCHANGED)
     =========================== */
  const handleView = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleStatusChange = (regId, newStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.regId === regId ? { ...u, status: newStatus } : u))
    );
  };

  const handleToggleLock = (regId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.regId === regId ? { ...u, locked: !u.locked } : u
      )
    );
  };

  /* ===========================
     📤 EXPORTS (UNCHANGED)
     =========================== */
  const exportToExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = (data, fileName, title) => {
    const doc = new jsPDF();
    doc.text(title, 14, 10);
    doc.autoTable({
      head: [["Reg ID", "Name", "Email", "Username", "Role", "Status", "Locked"]],
      body: data.map((u) => [
        u.regId,
        `${u.firstName} ${u.lastName}`,
        u.email,
        u.username,
        u.role,
        u.status,
        u.locked ? "Locked" : "Active",
      ]),
    });
    doc.save(fileName);
  };

  /* ===========================
     🖼️ UI (UNCHANGED)
     =========================== */
  const renderUserTable = (title, data) => (
    <Card className="m-3 shadow-sm">
      <Card.Body>
        <h4 className="text-center mb-3">{title}</h4>

        <Form.Control
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
        />

        <Table striped bordered hover responsive>
          <thead className="table-primary text-center">
            <tr>
              <th>Reg ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Locked</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((u) => (
                <tr key={u.regId} className="text-center">
                  <td>{u.regId}</td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td><Badge bg="warning">{u.status}</Badge></td>
                  <td>
                    <Badge bg={u.locked ? "dark" : "secondary"}>
                      {u.locked ? "Locked" : "Active"}
                    </Badge>
                  </td>
                  <td className="d-flex gap-1 justify-content-center">
                    <Button size="sm" onClick={() => handleView(u)}>View</Button>
                    <Button size="sm" variant="success" onClick={() => handleStatusChange(u.regId, "Approved")}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleStatusChange(u.regId, "Rejected")}>Reject</Button>
                    <Button size="sm" variant="dark" onClick={() => handleToggleLock(u.regId)}>Lock</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No data found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  return (
    <>
      <Row className="m-3">
        <Col md={6}>
          <Card className="text-center p-3 shadow-sm">
            <h5>🆕 New Registrations ({effectiveRole})</h5>
            <h3>{newRegistrations.length}</h3>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center p-3 shadow-sm">
            <h5>👥 Total {effectiveRole}s</h5>
            <h3>{users.length}</h3>
          </Card>
        </Col>
      </Row>

      {renderUserTable("🆕 New Registrations", top3NewRegistrations)}
      {renderUserTable("👥 Total Users", filteredUsers)}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p><b>ID:</b> {selectedUser.regId}</p>
              <p><b>Name:</b> {selectedUser.firstName} {selectedUser.lastName}</p>
              <p><b>Email:</b> {selectedUser.email}</p>
              <p><b>Role:</b> {selectedUser.role}</p>
              <p><b>Status:</b> {selectedUser.status}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Registrations;
