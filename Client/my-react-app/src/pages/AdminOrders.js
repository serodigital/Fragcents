import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth";

const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "cancelled"];

const statusBadgeClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-secondary";
    case "paid":
      return "bg-info";
    case "shipped":
      return "bg-primary";
    case "delivered":
      return "bg-success";
    case "cancelled":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

const AdminOrders = () => {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/orders", {
        headers: { Authorization: auth.token },
      });
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error("No orders found.");
      }
    } catch (error) {
      toast.error("Error fetching orders.");
    }
  }, [auth.token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(
        `http://localhost:8000/api/order/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: auth.token } },
      );
      if (data.success) {
        toast.success("Order status updated");
        fetchOrders();
      } else {
        toast.error(data.message || "Error updating status");
      }
    } catch (error) {
      toast.error("Error updating order status.");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZAR",
    }).format(price || 0);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const displayedOrders = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  return (
    <div className="card">
      <Toaster position="top-right" />
      <div className="card-header bg-primary text-white">Orders</div>
      <div className="card-body">
        <div className="mb-3" style={{ maxWidth: "250px" }}>
          <label className="form-label">Filter by Status</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {displayedOrders.length > 0 ? (
          displayedOrders.map((order) => (
            <div key={order._id} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <strong>{order.buyer?.name || "Unknown buyer"}</strong>
                  <div className="text-muted" style={{ fontSize: "13px" }}>
                    {order.buyer?.email}
                  </div>
                  <div className="text-muted" style={{ fontSize: "12px" }}>
                    Placed: {formatDate(order.createdAt)}
                  </div>
                </div>
                <span className={`badge ${statusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <hr className="my-2" />

              <ul className="list-unstyled mb-2" style={{ fontSize: "14px" }}>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} &times; {item.quantity} —{" "}
                    {formatPrice(item.price * item.quantity)}
                  </li>
                ))}
              </ul>

              {order.deliveryAddress && (
                <p className="mb-1 text-muted" style={{ fontSize: "13px" }}>
                  📍 {order.deliveryAddress}
                </p>
              )}

              <p className="mb-2">
                <strong>Total: {formatPrice(order.totalAmount)}</strong>
                {order.deliveryFee > 0 && (
                  <span className="text-muted">
                    {" "}
                    (incl. {formatPrice(order.deliveryFee)} delivery)
                  </span>
                )}
              </p>

              <div className="d-flex align-items-center gap-2">
                <label className="form-label mb-0" style={{ fontSize: "13px" }}>
                  Update status:
                </label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "160px" }}
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No orders found</p>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
