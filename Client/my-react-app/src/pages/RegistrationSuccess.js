import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/Auth";

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-5 text-center shadow-sm">
            <div style={{ fontSize: "4rem" }}>🎉</div>
            <h2 className="mt-3">Registration Successful</h2>
            <p className="text-muted mt-2 mb-4">
              {auth?.user?.name
                ? `Welcome to FragCents, ${auth.user.name}! Your account is ready.`
                : "Welcome to FragCents! Your account is ready."}
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/shop")}
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
