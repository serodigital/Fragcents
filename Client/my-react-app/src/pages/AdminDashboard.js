import React, { useState } from "react";
import AdminCategories from "./AdminCategories";
import AdminProducts from "./AdminProducts";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {/* Tabs for Navigation */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
            Manage Categories
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
            Manage Products
          </button>
        </li>
      </ul>

      {/* Render Content Based on Active Tab */}
      <div className="mt-4">
        {activeTab === "categories" ? <AdminCategories /> : <AdminProducts />}
      </div>
    </div>
  );
};

export default AdminDashboard;
