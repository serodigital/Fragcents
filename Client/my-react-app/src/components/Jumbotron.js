import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Jumbotron = ({ title, subtitle }) => {
  return (
    <div className="bg-light p-5 mb-4 rounded-3 text-center shadow-sm">
      <div className="container py-5">
        <h1 className="display-5 fw-bold text-dark">{title}</h1>
        {subtitle && <p className="lead text-secondary">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Jumbotron;



