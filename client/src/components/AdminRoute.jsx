import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user } = useAuth();
  if (!user?.token) return <Navigate to="/login" replace />;
  return user.role === "admin" ? <Outlet /> : <Navigate to="/browse" replace />;
};

export default AdminRoute;
