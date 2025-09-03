import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Auth";
import toast from "react-hot-toast";

const Header = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ user: null, token: "" }); // Clear authentication state
    localStorage.removeItem("auth"); // Remove auth data from localStorage
    toast.success("Logged out successfully");
    navigate("/login"); // Redirect to login page
  };

  const handleShopping = () => {
    navigate("/shopping"); // Redirect to shopping page
  };

  const handleHome = () => {
    navigate("/"); // Redirect to home page
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <button className="navbar-brand btn btn-link" onClick={handleHome}>
          Home
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {auth.token ? (
              <>
                <li className="nav-item">
                  <button className="btn btn-info me-2" onClick={handleShopping}>
                    Shopping
                  </button>
                </li>
                <li className="nav-item">
                  <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;


