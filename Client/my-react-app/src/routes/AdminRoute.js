import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/Auth";

const AdminRoute = ({ children }) => {
  const { auth, authLoading } = useAuth();

  if (authLoading) return null; // wait until Auth.js finishes checking localStorage

  if (!auth.user || (auth.user.role !== 1 && auth.user.role !== 2)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
