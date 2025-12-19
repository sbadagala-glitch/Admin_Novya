import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const TeacherEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const token = localStorage.getItem("authToken");

    const fetchEnquiries = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/teacher-enquiries`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok) {
          if (mounted) {
            setEnquiries([]);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        if (mounted) {
          setEnquiries(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error("Error loading teacher enquiries:", err);
          setEnquiries([]);
          setLoading(false);
        }
      }
    };

    fetchEnquiries();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div style={{ padding: "25px" }}>
      <h2 className="mb-4 fw-bold">👩‍🏫 Teacher Enquiries</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Teacher Name</th>
              <th>Email</th>
              <th>Teacher ID</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  No enquiries found.
                </td>
              </tr>
            ) : (
              enquiries.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.teacher_name}</td>
                  <td>{item.teacher_email}</td>
                  <td>{item.teacher_id}</td>
                  <td>{item.phone_number}</td>
                  <td>{item.message}</td>
                  <td>{item.status}</td>
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

export default TeacherEnquiries;
