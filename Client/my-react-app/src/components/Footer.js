import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center py-4 mt-auto">
      <div className="container">

        <p className="mb-2">
          <Link to="/terms-and-conditions" className="text-white text-decoration-none">
            Terms & Conditions
          </Link>
          {" | "}
          <Link to="/refund-policy" className="text-white text-decoration-none">
            Refund Policy
          </Link>
        </p>

        <p className="mb-0">
          &copy; {new Date().getFullYear()} FragCents. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;
