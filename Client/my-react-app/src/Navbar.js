import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./Context/Auth";

const Navbar = ({ cart = [] }) => {
  const { auth, setAuth } = useAuth();

  // Initialize auth state from localStorage if available
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth)); // Load the auth state from localStorage
    }
  }, [setAuth]);

  // Logout Function
  const handleLogout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth"); // Remove from localStorage
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand" to="/">
          Sero Digital
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {!auth.user ? (
              <>
                {/* Show Register & Login if user is NOT logged in */}
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Show Home, Dashboard, Shopping & Logout if user is logged in */}
                <li className="nav-item">
                  <Link className="nav-link" to="/home">
                    Home
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/shopping">
                    Shopping
                  </Link>
                </li>

                {/* Cart Icon */}
                <li className="nav-item position-relative">
                  <Link
                    to="/orders"
                    className="nav-link"
                    aria-label="View Cart"
                    style={{ fontSize: "1.5rem", padding: "0 10px" }}
                  >
                    🛒
                    {cart.length > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "0",
                          right: "0",
                          backgroundColor: "red",
                          color: "white",
                          borderRadius: "50%",
                          padding: "2px 6px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          transform: "translate(50%, -50%)",
                        }}
                      >
                        {cart.length}
                      </span>
                    )}
                  </Link>
                </li>

                <li className="nav-item">
                  <button className="btn btn-danger nav-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;

