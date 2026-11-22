import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="site-footer mt-auto">
      <div className="container">
        <nav className="site-footer-links">
          <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
          <span className="site-footer-divider" aria-hidden="true" />
          <Link to="/refund-policy">Refund Policy</Link>
        </nav>

        <p className="site-footer-copy">
          &copy; {new Date().getFullYear()} FragCents. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
