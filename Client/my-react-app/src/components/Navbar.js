import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/Auth";
import { useCart } from "../Context/CartContext";

const Navbar = () => {
  const { auth, setAuth } = useAuth();
  const { cart } = useCart();

  // Logout Function
  const handleLogout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand" to="/">
          Sero Digital
        </Link>

        {/* Mobile Menu Toggle */}
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
          <ul className="navbar-nav ms-auto">
            {/* Home Link */}
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            {/* Shop Link */}
            <li className="nav-item">
              <Link className="nav-link" to="/shop">
                Shop
              </Link>
            </li>

            {!auth.user ? (
              // Show Register/Login if not logged in
              <>
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
              // Show Dashboard & Logout if logged in
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>

                {/* Show Admin link only for users with admin role */}
                {auth.user.role === 1 && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      Admin
                    </Link>
                  </li>
                )}

                {/* Logout Button */}
                <li className="nav-item">
                  <button className="btn btn-danger nav-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Cart Link */}
            <li className="nav-item">
              <Link className="nav-link position-relative" to="/cart">
                <span className="d-flex align-items-center">
                  <span>Cart 🛒</span>
                  {cart.length > 0 && (
                    <span
                      className="badge position-absolute top-2 start-100 translate-middle badge-pill"
                      style={{ fontSize: "0.90rem" }}
                    >
                      {cart.length}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

