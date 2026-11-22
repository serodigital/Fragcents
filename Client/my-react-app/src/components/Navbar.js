import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Navbar as BsNavbar,
  Nav,
  NavDropdown,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import { useAuth } from "../Context/Auth";
import { useCart } from "../Context/CartContext";

const CartIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" />
  </svg>
);

const Navbar = () => {
  const { auth, setAuth } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/categories");
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories for navbar:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleLogout = () => {
    setAuth({ user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/shop?category=${categoryId}`);
  };

  return (
    <BsNavbar bg="primary" variant="dark" expand="lg" className="sd-navbar">
      <div className="container">
        <BsNavbar.Brand as={Link} to="/">
          Sero Digital
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="navbarNav" />

        <BsNavbar.Collapse id="navbarNav">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            <Nav.Link as={Link} to="/shop">
              Shop
            </Nav.Link>

            <NavDropdown title="Categories" id="categories-dropdown">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <NavDropdown.Item
                    key={cat._id}
                    onClick={() => handleCategoryClick(cat._id)}
                  >
                    {cat.name}
                  </NavDropdown.Item>
                ))
              ) : (
                <NavDropdown.Item disabled>No categories yet</NavDropdown.Item>
              )}
            </NavDropdown>

            <Nav.Link as={Link} to="/cart" className="sd-cart-link">
              <CartIcon />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="sd-cart-badge">{cart.length}</span>
              )}
            </Nav.Link>

            <Form
              className="sd-nav-search d-flex my-2 my-lg-0 mx-lg-3"
              onSubmit={handleSearchSubmit}
            >
              <FormControl
                type="text"
                size="sm"
                placeholder="Search fragrances"
                aria-label="Search fragrances"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="warning"
                size="sm"
                type="submit"
                className="ms-1"
              >
                Search
              </Button>
            </Form>

            {!auth.user ? (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            ) : (
              <NavDropdown
                title={auth.user.name}
                id="user-dropdown"
                align="end"
                className="sd-user-dropdown"
              >
                <NavDropdown.Item as={Link} to="/dashboard">
                  Dashboard
                </NavDropdown.Item>

                {(auth.user.role === 1 || auth.user.role === 2) && (
                  <NavDropdown.Item as={Link} to="/admin">
                    Admin
                  </NavDropdown.Item>
                )}

                <NavDropdown.Divider />

                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </div>
    </BsNavbar>
  );
};

export default Navbar;
