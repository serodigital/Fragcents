import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Auth";

const AdminRoute = ({ children }) => {
  const { auth } = useAuth();
  
  if (!auth.user || auth.user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
