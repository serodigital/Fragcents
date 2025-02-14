import React from "react";
import { useAuth } from "../context/Auth"; // Import useAuth
import { useNavigate } from "react-router-dom";   // For redirection after logout

const DashboardPage = () => {
  const { auth, setAuth } = useAuth();  // Get auth data and setAuth from context
  const navigate = useNavigate();       // For programmatic navigation

  // Logout Function
  const handleLogout = () => {
    setAuth({ user: null, token: "" });          // Clear auth state
    localStorage.removeItem("auth");             // Clear auth data from localStorage
    navigate("/register");                       // Redirect to the register page
  };

  return (
    <div className="container mt-5 d-flex justify-content-center " style={{ height: "40vh" }}>
      <div className="card p-4 shadow-sm text-center w-50">
        <h1>Welcome, {auth.user ? auth.user.name : "Guest"}!</h1>
        <p>Email: {auth.user ? auth.user.email : "N/A"}</p>

        {auth.user && (
          <div className="d-flex justify-content-center">
            <button
              onClick={handleLogout}
              className="btn btn-danger mt-3"
              style={{ width: "200px" }} // Custom width
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
