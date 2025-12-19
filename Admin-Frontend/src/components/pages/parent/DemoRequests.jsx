// import React, { useEffect, useState } from "react";
// import { Card, Table, Badge, Alert, Spinner } from "react-bootstrap";

// const API_BASE_URL =
//   process.env.REACT_APP_API_URL || "http://localhost:8000";

// const ParentDemoRequests = () => {
//   /* ===========================
//      🔽 STATE
//      =========================== */
//   const [demoRequests, setDemoRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   /* ===========================
//      🔄 LOAD DEMO REQUESTS
//      =========================== */
//   useEffect(() => {
//     loadDemoRequests();
//   }, []);

//   const loadDemoRequests = async () => {
//     try {
//       const token = localStorage.getItem("authToken");

//       const res = await fetch(`${API_BASE_URL}/api/admin/demo/`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       });

//       if (!res.ok) {
//         setLoading(false);
//         return;
//       }

//       const data = await res.json();
//       setDemoRequests(data || []);
//       setLoading(false);
//     } catch (err) {
//       console.error("Failed to load demo requests", err);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-3 p-md-4">
//       {/* HEADER */}
//       <h3 className="mb-1">Parent Demo Requests</h3>
//       <p className="text-muted mb-4">
//         Demo class requests submitted by parents
//       </p>

//       {/* LOADING */}
//       {loading ? (
//         <Alert variant="info" className="d-flex align-items-center gap-2">
//           <Spinner size="sm" />
//           Loading demo requests...
//         </Alert>
//       ) : demoRequests.length === 0 ? (
//         /* EMPTY STATE */
//         <Alert variant="warning">
//           No demo requests found
//         </Alert>
//       ) : (
//         /* TABLE */
//         <Card className="shadow-sm">
//           <Card.Body>
//             <Table responsive hover className="align-middle mb-0">
//               <thead className="table-light">
//                 <tr>
//                   <th>Name</th>
//                   <th>Email</th>
//                   <th>Phone</th>
//                   <th>Course</th>
//                   <th>Preferred Time</th>
//                   <th>Message</th>
//                   <th>Status</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {demoRequests.map((d) => (
//                   <tr key={d.demo_id}>
//                     <td>{d.full_name}</td>
//                     <td>{d.email}</td>
//                     <td>{d.phone_number}</td>
//                     <td>{d.course_of_interest}</td>
//                     <td>{d.preferred_time}</td>
//                     <td className="text-truncate" style={{ maxWidth: 200 }}>
//                       {d.message || "-"}
//                     </td>
//                     <td>
//                       <Badge
//                         bg={
//                           d.status === "approved"
//                             ? "success"
//                             : d.status === "rejected"
//                             ? "danger"
//                             : "warning"
//                         }
//                       >
//                         {d.status}
//                       </Badge>
//                     </td>
//                     <td>
//                       {d.created_at
//                         ? new Date(d.created_at).toLocaleDateString()
//                         : "-"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           </Card.Body>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default ParentDemoRequests;



import FreeDemoRequests from "../common/FreeDemoRequests";

const ParentDemoRequests = () => {
  return <FreeDemoRequests role="parent" />;
};

export default ParentDemoRequests;
