import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Auth";

const AdminDashboard = () => {
  const { auth } = useAuth();

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-header">
              <h4>Admin Navigation</h4>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <Link to="/admin/categories" className="nav-link">
                  Manage Categories
                </Link>
              </li>
              <li className="list-group-item">
                <Link to="/admin/products" className="nav-link">
                  Manage Products
                </Link>
              </li>
              {/* Add more admin links as needed */}
            </ul>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card">
            <div className="card-header">
              <h4>Admin Information</h4>
            </div>
            <div className="card-body">
              <h5>Welcome {auth?.user?.name}!</h5>
              <p>Email: {auth?.user?.email}</p>
              <p>Role: Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;