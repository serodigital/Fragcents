import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Jumbotron = ({ title, subtitle }) => { 
  return (
    <div className="jumbotron bg-light p-5 mb-12  text-center">
      <h1 className="text-grey">{title}</h1>
      <p className="lead text-grey">{subtitle}</p>
    </div>
  );
};

export default Jumbotron;
