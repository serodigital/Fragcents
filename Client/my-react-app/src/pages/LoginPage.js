import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/login",
        formData
      );

      if (data.token) {
        toast.success("Login successful!");

        // Store user and token in AuthContext and localStorage
        setAuth({
          user: {
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          },
          token: data.token,
        });
        localStorage.setItem("auth", JSON.stringify(data));

        // Redirect based on user role
        if (data.user.role === 1) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="container mt-5">
        <div className="row justify-content-center">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="col-md-4 col-lg-3"> {/* Adjusted form width */}
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        {/* Email Input */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
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

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
    </div>
    </div>
  );
};

export default LoginPage;
