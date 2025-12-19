// import React, { useEffect, useState } from "react";

// const StudentEnquiries = () => {
//   const [enquiries, setEnquiries] = useState([]);

//   useEffect(() => {
//     fetch("http://localhost:8000/api/student-enquiries")
//       .then(res => res.json())
//       .then(data => setEnquiries(data))
//       .catch(err => console.error("Error fetching student enquiries:", err));
//   }, []);

//   return (
//     <div className="p-4">
//       <div className="font-semibold text-xl mb-3">Student Enquiries</div>

//       <table className="table-auto w-full bg-white shadow-md rounded-md">
//         <thead className="bg-gray-100 text-left">
//           <tr>
//             <th className="p-3">ID</th>
//             <th className="p-3">User</th>
//             <th className="p-3">Email</th>
//             <th className="p-3">Issue</th>
//             <th className="p-3">Status</th>
//             <th className="p-3">Type</th>
//             <th className="p-3">Created</th>
//           </tr>
//         </thead>
//         <tbody>
//           {enquiries.length === 0 ? (
//             <tr>
//               <td colSpan="7" className="text-center p-4">
//                 No enquiries found.
//               </td>
//             </tr>
//           ) : (
//             enquiries.map((item) => (
//               <tr key={item.id} className="border-t">
//                 <td className="p-3">{item.id}</td>
//                 <td className="p-3">{item.name}</td>
//                 <td className="p-3">{item.email}</td>

//                 {/* Show extracted issue */}
//                 <td className="p-3 text-gray-700">{item.issue}</td>

//                 {/* Give DEFAULT status since backend doesn't send it */}
//                 <td className="p-3">
//                   <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm">
//                     Open
//                   </span>
//                 </td>

//                 {/* Give DEFAULT type */}
//                 <td className="p-3">Student Enquiry</td>

//                 <td className="p-3">
//                   {new Date(item.created_at).toLocaleString()}
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default StudentEnquiries;



import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const StudentEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/student-enquiries`)
      .then(res => res.json())
      .then(data => {
        setEnquiries(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching student enquiries:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4">
      <div className="fw-bold fs-4 mb-3">🎓 Student Enquiries</div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-bordered table-striped bg-white">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Type</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No enquiries found.
                </td>
              </tr>
            ) : (
              enquiries.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.issue}</td>

                  {/* DEFAULT STATUS (backend doesn’t send it yet) */}
                  <td>
                    <span className="badge bg-primary">Open</span>
                  </td>

                  <td>Student Enquiry</td>

                  <td>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentEnquiries;
