import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/register", formData);
      console.log("Registration response:", response.data); // Debug log

      if (response.data && response.data.token && response.data.user) {
        // Store user info and token
        setAuth({
          user: response.data.user,
          token: response.data.token,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success("Registration successful!");
        navigate("/dashboard");
      } else if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred during registration. Please try again.");
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
              <h2 className="text-center mb-4">Register</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your name"
                    required
                  />
                </div>

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
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>

                <div className="text-center mt-3">
                  <p className="mb-0">
                    Already have an account? <Link to="/login">Login</Link>
                  </p>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
