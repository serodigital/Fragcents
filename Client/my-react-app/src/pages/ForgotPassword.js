import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/forgot-password",
        { email },
      );
      toast.success(data.message || "Check your email for a reset link.");
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <Toaster position="top-right" />
        <div className="col-md-4 col-lg-3">
          <h2 className="text-center mb-4">Forgot Password</h2>
          {submitted ? (
            <p className="text-center">
              If that email is registered, a reset link is on its way.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  placeholder="Enter your account email"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
