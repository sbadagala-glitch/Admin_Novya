// src/components/DashboardContext.jsx
import React, { createContext, useContext, useState } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  // Active dashboard: student | parent | teacher
  const [dashboardView, setDashboardView] = useState("student");

  // Parent impersonation
  const [selectedParentEmail, setSelectedParentEmail] = useState("");
  const [parentChildren, setParentChildren] = useState([]);

  // Active child under Parent Dashboard
  const [selectedChildId, setSelectedChildId] = useState(null);

  return (
    <DashboardContext.Provider
      value={{
        dashboardView,
        setDashboardView,
        selectedParentEmail,
        setSelectedParentEmail,
        parentChildren,
        setParentChildren,
        selectedChildId,
        setSelectedChildId,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
