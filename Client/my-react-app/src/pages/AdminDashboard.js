import React, { useState } from "react";
import AdminCategories from "./AdminCategories";
import CreateProduct from "./CreateProduct";
import ProductsList from "./ProductsList";
import AdminOrders from "./AdminOrders";
import AdminUsers from "./AdminUsers";
import AdminFinances from "./AdminFinances";
import { useAuth } from "../Context/Auth";

const AdminDashboard = () => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const isManager = auth?.user?.role === 2;

  const linkClass = (tab) =>
    `btn w-100 text-start mb-2 ${
      activeTab === tab ? "btn-primary" : "btn-outline-primary"
    }`;

  return (
    <div className="container-fluid mt-4">
      <div className="p-4 mb-4 sd-welcome-banner">
        <h2 className="mb-1">Hello {auth?.user?.name || "Admin"}</h2>
        <p className="mb-0">Welcome to Fine Fragrance</p>
      </div>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="btn btn-primary w-100 mb-3 disabled">Admin Links</div>
          <button
            className={linkClass("categories")}
            onClick={() => setActiveTab("categories")}
          >
            Create category
          </button>
          <button
            className={linkClass("createProduct")}
            onClick={() => setActiveTab("createProduct")}
          >
            Create product
          </button>
          <button
            className={linkClass("productsList")}
            onClick={() => setActiveTab("productsList")}
          >
            Products
          </button>
          <button
            className={linkClass("orders")}
            onClick={() => setActiveTab("orders")}
          >
            📦 Orders
          </button>
          <button
            className={linkClass("users")}
            onClick={() => setActiveTab("users")}
          >
            👤 Users
          </button>
          {isManager && (
            <button
              className={linkClass("finances")}
              onClick={() => setActiveTab("finances")}
            >
              💰 Finances
            </button>
          )}
        </div>

        <div className="col-md-9">
          {activeTab === "info" && (
            <div className="card">
              <div className="card-header bg-primary text-white">
                Admin Information
              </div>
              <div className="card-body">
                <p>
                  <strong>Name:</strong> {auth?.user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {auth?.user?.email}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  {auth?.user?.role === 2
                    ? "Manager"
                    : auth?.user?.role === 1
                      ? "Admin"
                      : "User"}
                </p>
              </div>
            </div>
          )}
          {activeTab === "categories" && <AdminCategories />}
          {activeTab === "createProduct" && <CreateProduct />}
          {activeTab === "productsList" && <ProductsList />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "finances" && isManager && <AdminFinances />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
