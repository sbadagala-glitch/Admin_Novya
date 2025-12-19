// // src/components/Sidebar.jsx
// import React, { useState, useEffect } from "react";
// import { Nav, Offcanvas, Form, InputGroup } from "react-bootstrap";
// import { useNavigate, useLocation } from "react-router-dom";

// import {
//   FaTachometerAlt,
//   FaMoneyBill,
//   FaChartLine,
//   FaTicketAlt,
//   FaHeadset,
//   FaUserClock,
//   FaUserPlus,
//   FaSearch,
//   FaRegPlayCircle,
// } from "react-icons/fa";

// import { useDashboard } from "./DashboardContext";

// const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// const Sidebar = ({ showSidebar, darkMode, setShowSidebar, contactCount }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Dashboard context states
//   const {
//     dashboardView,
//     setDashboardView,
//     selectedParentEmail,
//     setSelectedParentEmail,
//     parentChildren,
//     setParentChildren,
//     setSelectedChildId,
//   } = useDashboard();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [parentsList, setParentsList] = useState([]);
//   const [activeItem, setActiveItem] = useState("Overview");

//   // Menu items
//   const menuItems = [
//     { name: "Overview", icon: <FaTachometerAlt />, page: "overview" },
//     { name: "Payments and Subscription", icon: <FaMoneyBill />, page: "payments" },
//     { name: "Progress", icon: <FaChartLine />, page: "progress" },
//     { name: "Free Demo", icon: <FaRegPlayCircle />, page: "freedemo" },
//     { name: "Support and Tickets", icon: <FaTicketAlt />, page: "tickets" },
//     { name: "Teacher Enquiries", icon: <FaHeadset />, page: "teacher-enquiries" },
//     { name: "Admin Activity Log", icon: <FaUserClock />, page: "admin-logs" },
//     { name: "Registrations", icon: <FaUserPlus />, page: "registrations" },
//   ];

//   // Set active navigation highlight
//   useEffect(() => {
//     const current = location.pathname.split("/")[3]; // /dashboard/{role}/{page}
//     const item = menuItems.find((i) => i.page === current);
//     setActiveItem(item ? item.name : "Overview");
//   }, [location.pathname]);

//   // Fetch list of parents
//   useEffect(() => {
//     const loadParents = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/api/dashboard/parents`);
//         if (!res.ok) return;
//         const data = await res.json();
//         setParentsList(data.parents || []);
//       } catch (err) {
//         console.warn("Failed to load parents", err);
//       }
//     };

//     loadParents();
//   }, []);

//   // Auto-load children when parent changes
//   useEffect(() => {
//     const loadChildren = async () => {
//       if (!selectedParentEmail) {
//         setParentChildren([]);
//         setSelectedChildId(null);
//         return;
//       }

//       try {
//         const res = await fetch(
//           `${API_BASE}/api/dashboard/parent/${encodeURIComponent(
//             selectedParentEmail
//           )}/children`
//         );

//         if (!res.ok) {
//           setParentChildren([]);
//           setSelectedChildId(null);
//           return;
//         }

//         const children = await res.json();
//         setParentChildren(children || []);

//         if (children?.length > 0) {
//           setSelectedChildId(children[0].student_id);
//         }
//       } catch (err) {
//         console.warn("Failed to fetch children", err);
//       }
//     };

//     loadChildren();
//   }, [selectedParentEmail]);

//   // Handle sidebar navigation click
//   const handleMenuClick = (item) => {
//     navigate(`/dashboard/${dashboardView}/${item.page}`);

//     if (item.page === "progress") setDashboardView("student");
//     if (item.page === "teacher-enquiries") setDashboardView("teacher");

//     if (window.innerWidth < 992) {
//       setShowSidebar(false);
//     }
//   };

//   const filteredItems = menuItems.filter((item) =>
//     item.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <Offcanvas
//       show={showSidebar}
//       onHide={() => setShowSidebar(false)}
//       responsive="lg"
//       backdrop={false}
//       className="sidebar"
//     >
//       <Offcanvas.Header closeButton closeVariant={darkMode ? "white" : undefined}>
//         <h4>NOVYA</h4>
//       </Offcanvas.Header>

//       <Offcanvas.Body style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        
//         {/* Search field */}
//         <Form className="mb-3">
//           <InputGroup>
//             <InputGroup.Text>
//               <FaSearch />
//             </InputGroup.Text>
//             <Form.Control
//               placeholder="Search menu..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </InputGroup>
//         </Form>

//         {/* Menu */}
//         <Nav className="flex-column mb-3">
//           {filteredItems.map((item) => {
//             const isActive = activeItem === item.name;

//             return (
//               <Nav.Link
//                 key={item.name}
//                 onClick={() => handleMenuClick(item)}
//                 className={`py-2 px-3 ${isActive ? "active-menu-item" : ""}`}
//                 style={{
//                   borderRadius: "6px",
//                   fontWeight: isActive ? "bold" : "normal",
//                   backgroundColor: isActive ? "#1e3c72" : "transparent",
//                   color: isActive ? "#fff" : "#03275eff",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//                   {item.icon}
//                   {item.name}
//                 </span>

//                 {item.page === "tickets" && contactCount > 0 && (
//                   <span className="badge bg-danger">{contactCount}</span>
//                 )}
//               </Nav.Link>
//             );
//           })}
//         </Nav>

//         {/* Parent impersonation */}
//         <div style={{ marginTop: "auto" }}>
//           <div className="mb-2">
//             <strong>Parent Impersonation</strong>
//           </div>

//           <Form.Select
//             value={selectedParentEmail || ""}
//             onChange={(e) => {
//               const email = e.target.value || "";
//               setSelectedParentEmail(email);

//               if (email) {
//                 setDashboardView("parent");
//                 navigate("/dashboard/parent/progress");
//               } else {
//                 setDashboardView("student");
//               }
//             }}
//           >
//             <option value="">Select parent</option>
//             {parentsList.map((p) => (
//               <option key={p} value={p}>
//                 {p}
//               </option>
//             ))}
//           </Form.Select>

//           {parentChildren?.length > 0 && (
//             <div className="mt-2">
//               <small className="text-muted">Children</small>
//               <ul className="list-unstyled">
//                 {parentChildren.slice(0, 5).map((c) => (
//                   <li key={c.student_id} className="small">
//                     {c.name || `Student ${c.student_id}`}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       </Offcanvas.Body>
//     </Offcanvas>
//   );
// };

// export default Sidebar;


// import React, { useState, useEffect } from "react";
// import { Nav, Offcanvas, Form, InputGroup } from "react-bootstrap";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaMoneyBill,
//   FaChartLine,
//   FaTicketAlt,
//   FaHeadset,
//   FaUserPlus,
//   FaSearch,
//   FaRegPlayCircle,
//   FaChalkboardTeacher,
//   FaUsers,
// } from "react-icons/fa";

// import { useDashboard } from "./DashboardContext";

// const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// const Sidebar = ({ showSidebar, darkMode, setShowSidebar, contactCount }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const {
//     dashboardView,
//     setDashboardView,
//     selectedParentEmail,
//     setSelectedParentEmail,
//     parentChildren,
//     setParentChildren,
//     setSelectedChildId,
//   } = useDashboard();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [parentsList, setParentsList] = useState([]);
//   const [activeItem, setActiveItem] = useState("");

//   // ---------------------------
//   // ROLE BASED MENU DEFINITIONS
//   // ---------------------------

//   const studentMenu = [
//     { name: "Overview", icon: <FaTachometerAlt />, page: "overview" },
//     { name: "Payments", icon: <FaMoneyBill />, page: "payments" },
//     { name: "Progress", icon: <FaChartLine />, page: "progress" },
//     { name: "Free Demo", icon: <FaRegPlayCircle />, page: "freedemo" },
//     { name: "Student Enquiries", icon: <FaTicketAlt />, page: "student-enquiries" },
//     { name: "Registrations", icon: <FaUserPlus />, page: "registrations" },
//   ];

//   const parentMenu = [
//     { name: "Overview", icon: <FaTachometerAlt />, page: "overview" },
//     { name: "Parent Enquiries", icon: <FaUsers />, page: "parent-enquiries" },
//     { name: "Payments", icon: <FaMoneyBill />, page: "payments" },
//     { name: "Demo Requests", icon: <FaRegPlayCircle />, page: "freedemo" },
//     { name: "Support", icon: <FaHeadset />, page: "tickets" },
//   ];

//   const teacherMenu = [
//     { name: "Overview", icon: <FaTachometerAlt />, page: "overview" },
//     { name: "Teacher Enquiries", icon: <FaChalkboardTeacher />, page: "teacher-enquiries" },
//     { name: "Demo Class Requests", icon: <FaRegPlayCircle />, page: "freedemo" },
//     { name: "Registrations", icon: <FaUserPlus />, page: "registrations" },
//   ];

//   const menuItems =
//     dashboardView === "student"
//       ? studentMenu
//       : dashboardView === "parent"
//       ? parentMenu
//       : teacherMenu;

//   // ---------------------------
//   // ACTIVE MENU HIGHLIGHT
//   // ---------------------------
//   useEffect(() => {
//     const page = location.pathname.split("/")[3];
//     const found = menuItems.find((m) => m.page === page);
//     setActiveItem(found?.name || "Overview");
//   }, [location.pathname, dashboardView]);

//   // ---------------------------
//   // FETCH PARENTS (ADMIN USE)
//   // ---------------------------
//   useEffect(() => {
//     const loadParents = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/api/dashboard/parents`);
//         if (!res.ok) return;
//         const data = await res.json();
//         setParentsList(data.parents || []);
//       } catch (err) {
//         console.warn("Failed to load parents", err);
//       }
//     };
//     loadParents();
//   }, []);

//   // ---------------------------
//   // NAVIGATION HANDLER
//   // ---------------------------
//   const handleMenuClick = (item) => {
//     navigate(`/dashboard/${dashboardView}/${item.page}`);
//     if (window.innerWidth < 992) setShowSidebar(false);
//   };

//   const filteredItems = menuItems.filter((item) =>
//     item.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <Offcanvas
//       show={showSidebar}
//       onHide={() => setShowSidebar(false)}
//       responsive="lg"
//       backdrop={false}
//       className="sidebar"
//     >
//       <Offcanvas.Header closeButton>
//         <h4 className="fw-bold">NOVYA ADMIN</h4>
//       </Offcanvas.Header>

//       <Offcanvas.Body className="d-flex flex-column h-100">
//         {/* Search */}
//         <Form className="mb-3">
//           <InputGroup>
//             <InputGroup.Text>
//               <FaSearch />
//             </InputGroup.Text>
//             <Form.Control
//               placeholder="Search menu..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </InputGroup>
//         </Form>

//         {/* Menu */}
//         <Nav className="flex-column">
//           {filteredItems.map((item) => (
//             <Nav.Link
//               key={item.name}
//               onClick={() => handleMenuClick(item)}
//               className={`py-2 px-3 ${activeItem === item.name ? "active-menu-item" : ""}`}
//               style={{
//                 borderRadius: "6px",
//                 fontWeight: activeItem === item.name ? "bold" : "normal",
//                 backgroundColor: activeItem === item.name ? "#1e3c72" : "transparent",
//                 color: activeItem === item.name ? "#fff" : "#03275e",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//               }}
//             >
//               {item.icon}
//               {item.name}
//             </Nav.Link>
//           ))}
//         </Nav>

//         {/* Parent Impersonation (Admin Only) */}
//         <div className="mt-auto">
//           <strong className="d-block mb-2">Parent Impersonation</strong>

//           <Form.Select
//             value={selectedParentEmail || ""}
//             onChange={(e) => {
//               const email = e.target.value;
//               setSelectedParentEmail(email);

//               if (email) {
//                 setDashboardView("parent");
//                 navigate("/dashboard/parent/overview");
//               } else {
//                 setDashboardView("student");
//               }
//             }}
//           >
//             <option value="">Select parent</option>
//             {parentsList.map((p) => (
//               <option key={p} value={p}>
//                 {p}
//               </option>
//             ))}
//           </Form.Select>

//           {parentChildren?.length > 0 && (
//             <ul className="mt-2 small text-muted">
//               {parentChildren.map((c) => (
//                 <li key={c.student_id}>
//                   {c.name || `Student ${c.student_id}`}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </Offcanvas.Body>
//     </Offcanvas>
//   );
// };

// export default Sidebar;



import React, { useState, useEffect } from "react";
import { Nav, Offcanvas, Form, InputGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaMoneyBill,
  FaChartLine,
  FaUserPlus,
  FaSearch,
  FaRegPlayCircle,
  FaChalkboardTeacher,
  FaUsers,
  FaHeadset,
} from "react-icons/fa";

import { useDashboard } from "./DashboardContext";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Sidebar = ({ showSidebar, darkMode, setShowSidebar, contactCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    dashboardView,
    setDashboardView,
    selectedParentEmail,
    setSelectedParentEmail,
    parentChildren,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState("");
  const [parentsList, setParentsList] = useState([]);
  const [activeItem, setActiveItem] = useState("");

  // ===============================
  // ROLE BASED MENU DEFINITIONS
  // ===============================
  const studentMenu = [
    { name: "Overview", icon: <FaTachometerAlt />, page: "overview" },
    { name: "Payments", icon: <FaMoneyBill />, page: "payments" },
    { name: "Progress", icon: <FaChartLine />, page: "progress" },
    { name: "Free Demo", icon: <FaRegPlayCircle />, page: "freedemo" },
    {
      name: "Student Enquiries",
      icon: <FaHeadset />,
      page: "student-enquiries",
    },
    { name: "Registrations", icon: <FaUserPlus />, page: "registrations" },
  ];

  const parentMenu = [
    { name: "Overview", icon: <FaTachometerAlt />, page: "overview" },
    {
      name: "Parent Enquiries",
      icon: <FaUsers />,
      page: "parent-enquiries",
    },
    { name: "Payments", icon: <FaMoneyBill />, page: "payments" },
    { name: "Free Demo Requests", icon: <FaRegPlayCircle />, page: "freedemo" },
    { name: "Registrations", icon: <FaUserPlus />, page: "registrations" },
  ];

  const teacherMenu = [
    { name: "Overview", icon: <FaTachometerAlt />, page: "overview" },
    {
      name: "Teacher Enquiries",
      icon: <FaChalkboardTeacher />,
      page: "teacher-enquiries",
    },
    {
      name: "Demo Class Requests",
      icon: <FaRegPlayCircle />,
      page: "demorequests",
    },
    { name: "Registrations", icon: <FaUserPlus />, page: "registrations" },
  ];

  const menuItems =
    dashboardView === "student"
      ? studentMenu
      : dashboardView === "parent"
      ? parentMenu
      : teacherMenu;

  // ===============================
  // ACTIVE MENU HIGHLIGHT
  // ===============================
  useEffect(() => {
    const page = location.pathname.split("/")[3];
    const found = menuItems.find((m) => m.page === page);
    setActiveItem(found?.name || "Overview");
  }, [location.pathname, dashboardView]);

  // ===============================
  // FETCH PARENTS (NOT IN TEACHER)
  // ===============================
  useEffect(() => {
    if (dashboardView === "teacher") return;

    const loadParents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/dashboard/parents`);
        if (!res.ok) return;
        const data = await res.json();
        setParentsList(data.parents || []);
      } catch (err) {
        console.warn("Failed to load parents", err);
      }
    };

    loadParents();
  }, [dashboardView]);

  const handleMenuClick = (item) => {
    navigate(`/dashboard/${dashboardView}/${item.page}`);
    if (window.innerWidth < 992) setShowSidebar(false);
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Offcanvas
      show={showSidebar}
      onHide={() => setShowSidebar(false)}
      responsive="lg"
      backdrop={false}
      className="sidebar"
    >
      <Offcanvas.Header closeButton>
        <h4 className="fw-bold">NOVYA ADMIN</h4>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column h-100">
        {/* Search */}
        <Form className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Form>

        {/* Menu */}
        <Nav className="flex-column">
          {filteredItems.map((item) => (
            <Nav.Link
              key={item.name}
              onClick={() => handleMenuClick(item)}
              className={`py-2 px-3 ${
                activeItem === item.name ? "active-menu-item" : ""
              }`}
            >
              <span className="d-flex align-items-center gap-2">
                {item.icon}
                {item.name}
              </span>
            </Nav.Link>
          ))}
        </Nav>

        {/* Parent Impersonation */}
        {dashboardView !== "teacher" && (
          <div className="mt-auto">
            <strong className="d-block mb-2">Parent Impersonation</strong>

            <Form.Select
              value={selectedParentEmail || ""}
              onChange={(e) => {
                const email = e.target.value;
                setSelectedParentEmail(email);

                if (email) {
                  setDashboardView("parent");
                  navigate("/dashboard/parent/overview");
                } else {
                  setDashboardView("student");
                }
              }}
            >
              <option value="">Select parent</option>
              {parentsList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Form.Select>

            {parentChildren?.length > 0 && (
              <ul className="mt-2 small text-muted">
                {parentChildren.map((c) => (
                  <li key={c.student_id}>
                    {c.name || `Student ${c.student_id}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;
