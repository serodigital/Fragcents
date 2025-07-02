import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { email, password } = formData;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Password validation (at least 8 characters, one uppercase, one lowercase, one number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 8 characters long and contain uppercase, lowercase, and number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/login`, 
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true // Important for handling cookies/sessions
        }
      );

      // Detailed logging for development
      console.log("Login response:", response.data);

      if (response.data.token) {
        // Success scenario
        toast.success("Login successful!");
        
        // Update authentication context
        setAuth({
          user: response.data.user,
          token: response.data.token,
        });

        // Persist authentication
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        // Handle unexpected response structure
        toast.error("Invalid server response. Please try again.");
      }
    } catch (error) {
      // Comprehensive error handling
      if (error.response) {
        // Server responded with an error
        const errorMessage = error.response.data.message 
          || error.response.data.error 
          || "Login failed. Please check your credentials.";
        
        toast.error(errorMessage);
        
        // Log detailed error for debugging
        console.error("Login Error Details:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        // Request made but no response received
        toast.error("No response from server. Please check your internet connection.");
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request
        toast.error("An unexpected error occurred. Please try again.");
        console.error("Error setting up request:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <Toaster position="top-right" reverseOrder={false} />
          
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Login</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span 
                          className="spinner-border spinner-border-sm me-2" 
                          role="status" 
                          aria-hidden="true"
                        ></span>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </form>
              
              <div className="text-center mt-3">
                <a href="/forgot-password" className="text-muted small">
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;



