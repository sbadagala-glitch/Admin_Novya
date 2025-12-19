// // src/components/TopBar.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Navbar,
//   Container,
//   Button,
//   Dropdown,
//   Modal,
//   Form,
//   Offcanvas,
//   Spinner,
//   Badge,
//   InputGroup,
//   FormControl,
// } from "react-bootstrap";
// import {
//   FaBell,
//   FaEnvelope,
//   FaUser,
//   FaBars,
//   FaTimes,
//   FaSignOutAlt,
//   FaEdit,
//   FaSearch,
// } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useDashboard } from "./DashboardContext";

// const TopBar = ({ showSidebar, toggleSidebar }) => {
//   const navigate = useNavigate();

//   const {
//     dashboardView,
//     setDashboardView,
//     selectedParentEmail,
//     setSelectedParentEmail,
//     parentChildren,
//     setParentChildren,
//     selectedChildId,
//     setSelectedChildId,
//   } = useDashboard();

//   const [showProfileModal, setShowProfileModal] = useState(false);

//   const [profileName, setProfileName] = useState("");
//   const [profileEmail, setProfileEmail] = useState("");

//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [loadingNotifications, setLoadingNotifications] = useState(true);

//   const [parentSearch, setParentSearch] = useState("");
//   const [parentSearchResults, setParentSearchResults] = useState([]);
//   const [impersonating, setImpersonating] = useState("");

//   useEffect(() => {
//     setProfileName(localStorage.getItem("profileName") || "User");
//     setProfileEmail(localStorage.getItem("profileEmail") || "user@example.com");
//   }, []);

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/", { replace: true });
//   };

//   // Auto-navigate when dashboardView changes
//   useEffect(() => {
//     navigate(`/dashboard/${dashboardView}/overview`);
//   }, [dashboardView]);

//   const searchParents = async (q) => {
//     if (q.length < 3) {
//       setParentSearchResults([]);
//       return;
//     }

//     try {
//       const res = await axios.get(
//         `${
//           process.env.REACT_APP_API_URL || "http://localhost:8000"
//         }/api/admin/users?search=${encodeURIComponent(q)}`
//       );
//       setParentSearchResults(res.data || []);
//     } catch {
//       setParentSearchResults([]);
//     }
//   };

//   const handleSelectParent = async (email) => {
//     setSelectedParentEmail(email);
//     setImpersonating(email);

//     try {
//       const response = await axios.get(
//         `${
//           process.env.REACT_APP_API_URL || "http://localhost:8000"
//         }/api/dashboard/parent/${email}/children`
//       );
//       setParentChildren(response.data);

//       if (response.data.length > 0) {
//         setSelectedChildId(response.data[0].student_id);
//       }
//     } catch {
//       setParentChildren([]);
//       setSelectedChildId(null);
//     }
//   };

//   const handleClearImpersonation = () => {
//     setSelectedParentEmail("");
//     setImpersonating("");
//     setParentChildren([]);
//     setSelectedChildId(null);
//   };

//   return (
//     <>
//       <Navbar bg="light" className="top-nav fixed-top px-2" expand="lg">
//         <Container
//           fluid
//           className="d-flex justify-content-between align-items-center"
//         >
//           {/* Sidebar Toggle */}
//           <div className="d-flex align-items-center">
//             <Button variant="link" className="me-2 p-0" onClick={toggleSidebar}>
//               {showSidebar ? <FaTimes className="fs-4" /> : <FaBars className="fs-4" />}
//             </Button>

//             <Navbar.Brand className="fw-bold d-flex align-items-center">
//               <img
//                 src="/NOVYA LOGO (1).png"
//                 alt="NOVYA Logo"
//                 style={{
//                   width: "60px",
//                   height: "60px",
//                   marginRight: "10px",
//                   borderRadius: "5px",
//                 }}
//               />
//               <span
//                 className="d-none d-sm-inline fw-bold"
//                 style={{
//                   fontSize: "1.8rem",
//                   background:
//                     "linear-gradient(90deg, #6D0DAD, #C316A4, #F02D6D, #FF5E52)",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                 }}
//               >
//                 NOVYA
//               </span>
//             </Navbar.Brand>
//           </div>

//           {/* Dashboard Switcher */}
//           <Form.Select
//             value={dashboardView}
//             onChange={(e) => setDashboardView(e.target.value)}
//             style={{ width: "170px" }}
//           >
//             <option value="student">Student Dashboard</option>
//             <option value="parent">Parent Dashboard</option>
//             <option value="teacher">Teacher Dashboard</option>
//           </Form.Select>

//           {/* Right-side actions */}
//           <div className="d-flex align-items-center gap-3">
//             {/* Notifications */}
//             <Button
//               variant="link"
//               className="position-relative p-0"
//               onClick={() => setShowNotifications(true)}
//             >
//               <FaBell className="fs-5" />
//               {notifications.length > 0 && (
//                 <Badge pill bg="danger" className="position-absolute">
//                   {notifications.length}
//                 </Badge>
//               )}
//             </Button>

//             {/* Email */}
//             <Button
//               variant="link"
//               className="p-0"
//               onClick={() => window.open("https://mail.google.com")}
//             >
//               <FaEnvelope className="fs-5" />
//             </Button>

//             {/* Parent Impersonation */}
//             <InputGroup size="sm" style={{ minWidth: 220 }}>
//               <FormControl
//                 placeholder="Impersonate parent (email)"
//                 value={parentSearch}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   setParentSearch(val);
//                   searchParents(val);
//                 }}
//               />
//               <Button
//                 variant="outline-secondary"
//                 onClick={() => handleSelectParent(parentSearch)}
//               >
//                 <FaSearch />
//               </Button>
//             </InputGroup>

//             {impersonating && (
//               <Badge
//                 bg="info"
//                 style={{ cursor: "pointer" }}
//                 onClick={handleClearImpersonation}
//               >
//                 {impersonating} ×
//               </Badge>
//             )}

//             {/* User Dropdown */}
//             <Dropdown align="end">
//               <Dropdown.Toggle variant="link" className="p-0">
//                 <FaUser className="fs-5" />
//               </Dropdown.Toggle>
//               <Dropdown.Menu>
//                 <Dropdown.Item onClick={() => setShowProfileModal(true)}>
//                   <FaEdit className="me-2" />
//                   Profile
//                 </Dropdown.Item>

//                 <Dropdown.Divider />

//                 <Dropdown.Item onClick={handleLogout}>
//                   <FaSignOutAlt className="me-2" />
//                   Logout
//                 </Dropdown.Item>
//               </Dropdown.Menu>
//             </Dropdown>
//           </div>
//         </Container>
//       </Navbar>
//     </>
//   );
// };

// export default TopBar;




import React, { useState, useEffect } from "react";
import {
  Navbar,
  Container,
  Button,
  Dropdown,
  Modal,
  Form,
  Offcanvas,
  Spinner,
  Badge,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import {
  FaBell,
  FaEnvelope,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaEdit,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDashboard } from "./DashboardContext";

const TopBar = ({ showSidebar, toggleSidebar }) => {
  const navigate = useNavigate();

  const {
    dashboardView,
    setDashboardView,
    selectedParentEmail,
    setSelectedParentEmail,
    parentChildren,
    setParentChildren,
    selectedChildId,
    setSelectedChildId,
  } = useDashboard();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const [parentSearch, setParentSearch] = useState("");
  const [parentSearchResults, setParentSearchResults] = useState([]);
  const [impersonating, setImpersonating] = useState("");

  // ---------------- PROFILE LOAD ----------------
  useEffect(() => {
    setProfileName(localStorage.getItem("profileName") || "User");
    setProfileEmail(localStorage.getItem("profileEmail") || "user@example.com");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  // ---------------- ROLE SWITCH HANDLER (SAFE) ----------------
  const handleDashboardChange = (newRole) => {
    // Reset impersonation when leaving parent dashboard
    if (newRole !== "parent") {
      setSelectedParentEmail("");
      setParentChildren([]);
      setSelectedChildId(null);
      setImpersonating("");
      setParentSearch("");
    }

    setDashboardView(newRole);
    navigate(`/dashboard/${newRole}/overview`);
  };

  // ---------------- PARENT SEARCH ----------------
  const searchParents = async (q) => {
    if (q.length < 3) {
      setParentSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/admin/users?search=${encodeURIComponent(q)}`
      );
      setParentSearchResults(res.data || []);
    } catch {
      setParentSearchResults([]);
    }
  };

  // ---------------- SELECT PARENT ----------------
  const handleSelectParent = async (email) => {
    if (!email) return;

    setSelectedParentEmail(email);
    setImpersonating(email);
    setDashboardView("parent");

    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8000"
        }/api/dashboard/parent/${email}/children`
      );

      setParentChildren(response.data || []);

      if (response.data?.length > 0) {
        setSelectedChildId(response.data[0].student_id);
      }

      navigate("/dashboard/parent/overview");
    } catch {
      setParentChildren([]);
      setSelectedChildId(null);
    }
  };

  const handleClearImpersonation = () => {
    setSelectedParentEmail("");
    setImpersonating("");
    setParentChildren([]);
    setSelectedChildId(null);
    setParentSearch("");
    setDashboardView("student");
    navigate("/dashboard/student/overview");
  };

  return (
    <>
      <Navbar bg="light" className="top-nav fixed-top px-2" expand="lg">
        <Container fluid className="d-flex justify-content-between align-items-center">
          {/* Sidebar Toggle */}
          <div className="d-flex align-items-center">
            <Button variant="link" className="me-2 p-0" onClick={toggleSidebar}>
              {showSidebar ? (
                <FaTimes className="fs-4" />
              ) : (
                <FaBars className="fs-4" />
              )}
            </Button>

            <Navbar.Brand className="fw-bold d-flex align-items-center">
              <img
                src="/NOVYA LOGO (1).png"
                alt="NOVYA Logo"
                style={{
                  width: "60px",
                  height: "60px",
                  marginRight: "10px",
                  borderRadius: "5px",
                }}
              />
              <span
                className="d-none d-sm-inline fw-bold"
                style={{
                  fontSize: "1.8rem",
                  background:
                    "linear-gradient(90deg, #6D0DAD, #C316A4, #F02D6D, #FF5E52)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                NOVYA
              </span>
            </Navbar.Brand>
          </div>

          {/* DASHBOARD SWITCHER */}
          <Form.Select
            value={dashboardView}
            onChange={(e) => handleDashboardChange(e.target.value)}
            style={{ width: "190px" }}
          >
            <option value="student">Student Dashboard</option>
            <option value="parent">Parent Dashboard</option>
            <option value="teacher">Teacher Dashboard</option>
          </Form.Select>

          {/* RIGHT SIDE ACTIONS */}
          <div className="d-flex align-items-center gap-3">
            <Button
              variant="link"
              className="position-relative p-0"
              onClick={() => setShowNotifications(true)}
            >
              <FaBell className="fs-5" />
              {notifications.length > 0 && (
                <Badge pill bg="danger" className="position-absolute">
                  {notifications.length}
                </Badge>
              )}
            </Button>
            <Button
              variant="link"
              className="p-0"
              onClick={() => window.open("https://mail.google.com")}
            >
              <FaEnvelope className="fs-5" />
            </Button>

            {/* PARENT IMPERSONATION (HIDDEN IN TEACHER DASHBOARD) */}
            {dashboardView !== "teacher" && (
              <>
                <InputGroup size="sm" style={{ minWidth: 220 }}>
                  <FormControl
                    placeholder="Impersonate parent (email)"
                    value={parentSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setParentSearch(val);
                      searchParents(val);
                    }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleSelectParent(parentSearch)}
                  >
                    <FaSearch />
                  </Button>
                </InputGroup>

                {impersonating && (
                  <Badge
                    bg="info"
                    style={{ cursor: "pointer" }}
                    onClick={handleClearImpersonation}
                  >
                    {impersonating} ×
                  </Badge>
                )}
              </>
            )}

            {/* USER MENU */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="p-0">
                <FaUser className="fs-5" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setShowProfileModal(true)}>
                  <FaEdit className="me-2" />
                  Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </Navbar>
    </>
  );
};

export default TopBar;
