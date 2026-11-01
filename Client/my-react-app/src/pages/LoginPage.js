
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Auth";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/login",
        formData,
      );

      if (data.token && data.user) {
        toast.success("Login successful!");

        // Make sure the user ID is stored
        const loggedInUser = {
          _id: data.user._id || data.user.id,
          name: data.user.name || "",
          email: data.user.email || "",
          role: data.user.role ?? 0,
          phone: data.user.phone || "",
          address: data.user.address || {},
        };

        console.log("=================================");
        console.log("LOGIN USER DATA");
        console.log("User:", loggedInUser);
        console.log("User ID:", loggedInUser._id);
        console.log("Token:", data.token);
        console.log("=================================");

        // Store the complete authentication object
        const authData = {
          user: loggedInUser,
          token: data.token,
        };

        // Update AuthContext
        setAuth(authData);

        // Store the SAME structure in localStorage
        localStorage.setItem("auth", JSON.stringify(authData));

        // Redirect based on user role
        if (loggedInUser.role === 1) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
<<<<<<< HEAD
        error.response?.data?.error || "An error occurred. Please try again.",
=======
        error.response?.data?.error ||
          "An error occurred. Please try again."
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
      );
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
<<<<<<< HEAD
        <Toaster position="top-right" reverseOrder={false} />
        <div className="col-md-4 col-lg-3">
          {" "}
          {/* Adjusted form width */}
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            {/* Email Input */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
=======

        <Toaster
          position="top-right"
          reverseOrder={false}
        />

        <div className="col-md-4 col-lg-3">
          <h2 className="text-center mb-4">
            Login
          </h2>

          <form
            onSubmit={handleSubmit}
            className="card p-4 shadow-sm"
          >
            {/* Email Input */}
            <div className="mb-3">
              <label
                htmlFor="email"
                className="form-label"
              >
                Email
              </label>

>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your email"
                required
              />
            </div>
<<<<<<< HEAD

            {/* Password Input */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="text-center mt-3">
              <a href="/forgot-password">Forgot password?</a>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
=======

            {/* Password Input */}
            <div className="mb-3">
              <label
                htmlFor="password"
                className="form-label"
              >
                Password
              </label>

              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100"
            >
              Login
            </button>
          </form>
        </div>

>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
      </div>
    </div>
  );
};

export default LoginPage;
