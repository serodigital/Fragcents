import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Jumbotron = ({ title, subtitle }) => {
  return (
    <div className="jumbotron bg-light p-5 mb-4 rounded-3 text-center">
      <h1 className="display-4">{title}</h1>
      <p className="lead">{subtitle}</p>
    </div>
  );
};

export default Jumbotron;
