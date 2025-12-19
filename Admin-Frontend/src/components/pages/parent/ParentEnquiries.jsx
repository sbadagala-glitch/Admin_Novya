import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const ParentEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/core/parent/contact/list/`
      );
      setEnquiries(res.data || []);
    } catch (err) {
      console.error("Failed to load parent enquiries", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="fw-bold mb-3">👪 Parent Enquiries</h2>

      {loading ? (
        <p>Loading...</p>
      ) : enquiries.length === 0 ? (
        <p>No enquiries found.</p>
      ) : (
        enquiries.map((item) => (
          <div key={item.id} className="p-3 border rounded mb-2 bg-white">
            <strong>{item.name}</strong>
            <br />
            <small>{item.email}</small>
            <p className="mt-2">{item.message}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ParentEnquiries;
