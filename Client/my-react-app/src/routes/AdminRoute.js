import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/Auth";

const AdminRoute = ({ children }) => {
  const { auth } = useAuth();
  
  if (!auth.user || auth.user.role !== 1) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
