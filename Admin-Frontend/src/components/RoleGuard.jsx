import { Navigate, useParams } from "react-router-dom";
import { useDashboard } from "./DashboardContext";

const RoleGuard = ({ children }) => {
  const { role } = useParams();
  const { dashboardView } = useDashboard();

  // 🚫 If URL role doesn't match selected dashboard role
  if (role !== dashboardView) {
    return <Navigate to={`/dashboard/${dashboardView}/overview`} replace />;
  }

  return children;
};

export default RoleGuard;
