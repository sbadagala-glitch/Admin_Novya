// import React, { useEffect, useRef, useState } from "react";
// import { Row, Col, Card, Table, Badge, Alert } from "react-bootstrap";
// import { FaChartBar, FaUsers, FaUser } from "react-icons/fa";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { v4 as uuidv4 } from "uuid";

// Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// /* ===========================
//    🔒 SIMPLE IN-MEMORY CACHE
//    =========================== */
// const overviewCache = {};

// const Overview = ({ role }) => {
//   const API_BASE_URL =
//     process.env.REACT_APP_API_URL || "http://localhost:8000";

//   // ❌ chartRef not required (kept ref logic removed safely)
//   // const chartRef = useRef(null);

//   const [registrations, setRegistrations] = useState([]);
//   const [stats, setStats] = useState({
//     revenue: 0,
//     newUsers: 0,
//     totalUsers: 0,
//   });

//   // ✅ REAL ANALYTICS CHART STATE
//   const [chartData, setChartData] = useState(null);

//   useEffect(() => {
//     loadRegistrations();
//     loadChartAnalytics();
//     // eslint-disable-next-line
//   }, [role]);

//   /* ===========================
//      🔄 LOAD REGISTRATIONS (CACHED)
//      =========================== */
//   const loadRegistrations = async () => {
//     // ✅ USE CACHE FIRST
//     if (overviewCache[role]) {
//       setRegistrations(overviewCache[role].registrations);
//       setStats(overviewCache[role].stats);
//       return;
//     }

//     try {
//       const token = localStorage.getItem("authToken");

//       const res = await fetch(
//         `${API_BASE_URL}/api/admin/users/recent`,
//         {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         }
//       );

//       if (!res.ok) {
//         setRegistrations([]);
//         return;
//       }

//       const list = await res.json();

//       // ✅ ROLE FILTER
//       const filtered = list.filter(
//         (u) => u.role?.toLowerCase() === role.toLowerCase()
//       );

//       const mapped = filtered.map((u) => ({
//         id: u.userid ?? uuidv4(),
//         name: `${u.firstname || ""} ${u.lastname || ""}`.trim(),
//         type: u.role,
//         date: u.createdat
//           ? new Date(u.createdat).toISOString().slice(0, 10)
//           : "-",
//         status: u.is_active ? "Approved" : "Pending",
//       }));

//       const statsData = {
//         revenue:
//           role === "student"
//             ? mapped.length * 500
//             : role === "parent"
//             ? mapped.length * 800
//             : mapped.length * 1000,
//         newUsers: mapped.length,
//         totalUsers: mapped.length,
//       };

//       // ✅ SAVE CACHE
//       overviewCache[role] = {
//         registrations: mapped,
//         stats: statsData,
//       };

//       setRegistrations(mapped);
//       setStats(statsData);
//     } catch (err) {
//       console.error("Overview registrations error:", err);
//       setRegistrations([]);
//     }
//   };

//   /* ===========================
//      📊 LOAD REAL ROLE ANALYTICS
//      =========================== */
//   const loadChartAnalytics = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       let url = "";

//       // ---------- STUDENT ----------
//       if (role === "student") {
//         url = `${API_BASE_URL}/api/dashboard/student/progress?class=7`;
//       }

//       // ---------- TEACHER ----------
//       if (role === "teacher") {
//         url = `${API_BASE_URL}/api/dashboard/teacher/progress?class=7`;
//       }

//       // ---------- PARENT ----------
//       if (role === "parent") {
//         const parentEmail = localStorage.getItem("parentEmail");

//         // ✅ SAFE GUARD
//         if (!parentEmail) {
//           setChartData(null);
//           return;
//         }

//         const res = await fetch(
//           `${API_BASE_URL}/api/dashboard/parent/${parentEmail}/progress`,
//           {
//             headers: token ? { Authorization: `Bearer ${token}` } : {},
//           }
//         );

//         if (!res.ok) return;

//         const data = await res.json();

//         const subjectTotals = {};
//         const subjectCounts = {};

//         data.children.forEach((child) => {
//           Object.entries(child.scores || {}).forEach(([subject, score]) => {
//             subjectTotals[subject] =
//               (subjectTotals[subject] || 0) + score;
//             subjectCounts[subject] =
//               (subjectCounts[subject] || 0) + 1;
//           });
//         });

//         const subjects = Object.keys(subjectTotals);
//         const averages = subjects.map((s) =>
//           Math.round(subjectTotals[s] / subjectCounts[s])
//         );

//         setChartData({
//           labels: subjects,
//           datasets: [
//             {
//               label: "Average Child Performance",
//               data: averages,
//               backgroundColor: "#198754",
//             },
//           ],
//         });

//         return;
//       }

//       // ---------- STUDENT / TEACHER ----------
//       const res = await fetch(url, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       });

//       if (!res.ok) return;

//       const data = await res.json();

//       const subjects = data.subjects || [];
//       const averages = subjects.map(
//         (s) => data.subjectAverages?.[s] || 0
//       );

//       setChartData({
//         labels: subjects,
//         datasets: [
//           {
//             label: "Average Score",
//             data: averages,
//             backgroundColor: "#0d6efd",
//           },
//         ],
//       });
//     } catch (err) {
//       console.error("Overview chart error:", err);
//     }
//   };

//   return (
//     <div className="p-2 p-md-4">
//       {/* HEADER */}
//       <Alert
//         variant="info"
//         className="mb-4 d-flex align-items-center justify-content-between"
//       >
//         <strong>📊 {role.toUpperCase()} Dashboard Overview</strong>
//       </Alert>

//       {/* STATS */}
//       <Row className="g-4 mb-4">
//         <Col md={4}>
//           <Card className="h-100 shadow-sm text-center">
//             <Card.Body className="d-flex flex-column align-items-center justify-content-center">
//               <FaChartBar size={28} className="mb-2 text-primary" />
//               <h4 className="mb-1">₹{stats.revenue}</h4>
//               <small className="text-muted">Revenue</small>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col md={4}>
//           <Card className="h-100 shadow-sm text-center">
//             <Card.Body className="d-flex flex-column align-items-center justify-content-center">
//               <FaUsers size={28} className="mb-2 text-success" />
//               <h4 className="mb-1">{stats.newUsers}</h4>
//               <small className="text-muted">
//                 New {role.charAt(0).toUpperCase() + role.slice(1)}s
//               </small>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col md={4}>
//           <Card className="h-100 shadow-sm text-center">
//             <Card.Body className="d-flex flex-column align-items-center justify-content-center">
//               <FaUser size={28} className="mb-2 text-warning" />
//               <h4 className="mb-1">{stats.totalUsers}</h4>
//               <small className="text-muted">
//                 Total {role} Registrations
//               </small>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* CHART */}
//       {chartData && (
//         <Card className="mb-4 shadow-sm">
//           <Card.Body className="p-3 p-md-4">
//             <Bar
//               data={chartData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//               }}
//               height={300}
//             />
//           </Card.Body>
//         </Card>
//       )}

//       {/* RECENT REGISTRATIONS */}
//       <Card className="shadow-sm">
//         <Card.Body className="p-3 p-md-4">
//           <h5 className="mb-3">
//             Recent {role.charAt(0).toUpperCase() + role.slice(1)} Registrations
//           </h5>

//           <div className="table-responsive">
//             <Table hover className="align-middle mb-0">
//               <thead className="table-light">
//                 <tr>
//                   <th>Name</th>
//                   <th>Role</th>
//                   <th>Date</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {registrations.length === 0 ? (
//                   <tr>
//                     <td colSpan="4" className="text-center text-muted py-4">
//                       No {role} registrations found
//                     </td>
//                   </tr>
//                 ) : (
//                   registrations.map((r) => (
//                     <tr key={r.id}>
//                       <td>{r.name}</td>
//                       <td>{r.type}</td>
//                       <td>{r.date}</td>
//                       <td>
//                         <Badge
//                           bg={
//                             r.status === "Approved"
//                               ? "success"
//                               : "warning"
//                           }
//                         >
//                           {r.status}
//                         </Badge>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </Table>
//           </div>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default Overview;


// src/components/pages/common/Overview.jsx
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Table, Badge, Alert } from "react-bootstrap";
import { FaChartBar, FaUsers, FaUser } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const overviewCache = {};

const Overview = ({ role }) => {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8000";

  const chartRef = useRef(null);

  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    newUsers: 0,
    totalUsers: 0,
  });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    loadRegistrations();
    loadChartAnalytics();
    // eslint-disable-next-line
  }, [role]);

  /* ===========================
     🔄 LOAD REGISTRATIONS
     =========================== */
  const loadRegistrations = async () => {
    if (overviewCache[role]) {
      setRegistrations(overviewCache[role].registrations);
      setStats(overviewCache[role].stats);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(`${API_BASE_URL}/api/admin/users/recent`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) return;

      const list = await res.json();

      const filtered = list.filter(
        (u) => u.role?.toLowerCase() === role.toLowerCase()
      );

      const mapped = filtered.map((u) => ({
        id: u.userid,
        name: `${u.firstname || ""} ${u.lastname || ""}`.trim(),
        type: u.role,
        date: u.createdat
          ? new Date(u.createdat).toISOString().slice(0, 10)
          : "-",
        status: u.is_active ? "Approved" : "Pending",
      }));

      const statsData = {
        revenue:
          role === "student"
            ? mapped.length * 500
            : role === "parent"
            ? mapped.length * 800
            : mapped.length * 1000,
        newUsers: mapped.length,
        totalUsers: mapped.length,
      };

      overviewCache[role] = {
        registrations: mapped,
        stats: statsData,
      };

      setRegistrations(mapped);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  };

  /* ===========================
     📊 LOAD ROLE-BASED CHART
     =========================== */
  const loadChartAnalytics = async () => {
    try {
      const token = localStorage.getItem("authToken");
      let url = "";

      if (role === "student") {
        url = `${API_BASE_URL}/api/dashboard/student/progress?class=7`;
      }

      if (role === "teacher") {
        url = `${API_BASE_URL}/api/dashboard/teacher/progress?class=7`;
      }

      if (role === "parent") {
        const parentEmail = localStorage.getItem("parentEmail");
        if (!parentEmail) return;

        const res = await fetch(
          `${API_BASE_URL}/api/dashboard/parent/${parentEmail}/progress`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (!res.ok) return;

        const data = await res.json();

        const totals = {};
        const counts = {};

        data.children.forEach((child) => {
          Object.entries(child.scores || {}).forEach(([sub, score]) => {
            totals[sub] = (totals[sub] || 0) + score;
            counts[sub] = (counts[sub] || 0) + 1;
          });
        });

        const subjects = Object.keys(totals);
        const averages = subjects.map(
          (s) => Math.round(totals[s] / counts[s])
        );

        setChartData({
          labels: subjects,
          datasets: [
            {
              label: "Average Child Performance",
              data: averages,
              backgroundColor: "#198754",
            },
          ],
        });
        return;
      }

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) return;

      const data = await res.json();

      setChartData({
        labels: data.subjects,
        datasets: [
          {
            label: "Average Score",
            data: data.subjects.map((s) => data.subjectAverages[s] || 0),
            backgroundColor: "#0d6efd",
          },
        ],
      });
    } catch (err) {
      console.error("Chart load error", err);
    }
  };

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <Alert variant="info" className="dashboard-header">
        📊 {role.toUpperCase()} Dashboard Overview
      </Alert>

      {/* STATS */}
      <Row className="g-4 dashboard-cards">
        <Col md={4}>
          <Card className="dashboard-card shadow-sm">
            <Card.Body>
              <FaChartBar size={26} className="mb-2 text-primary" />
              <h4>₹{stats.revenue}</h4>
              <small className="text-muted">Revenue</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="dashboard-card shadow-sm">
            <Card.Body>
              <FaUsers size={26} className="mb-2 text-success" />
              <h4>{stats.newUsers}</h4>
              <small className="text-muted">New {role}s</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="dashboard-card shadow-sm">
            <Card.Body>
              <FaUser size={26} className="mb-2 text-warning" />
              <h4>{stats.totalUsers}</h4>
              <small className="text-muted">Total Registrations</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CHART */}
      {chartData && (
        <Card className="dashboard-chart shadow-sm">
          <Card.Body>
            <Bar
              ref={chartRef}
              data={chartData}
              options={{ responsive: true, maintainAspectRatio: false }}
              height={300}
            />
          </Card.Body>
        </Card>
      )}

      {/* TABLE */}
      <Card className="dashboard-table shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Recent Registrations</h5>
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No data
                    </td>
                  </tr>
                ) : (
                  registrations.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.type}</td>
                      <td>{r.date}</td>
                      <td>
                        <Badge
                          bg={r.status === "Approved" ? "success" : "warning"}
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Overview;
