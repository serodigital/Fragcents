import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/Auth";
import toast from "react-hot-toast";

const AdminFinances = () => {
  const { auth } = useAuth();
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      setLoading(true);
      try {
        const [summaryRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:8000/api/finance-summary", {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
          axios.get("http://localhost:8000/api/orders", {
            headers: { Authorization: `Bearer ${auth.token}` },
          }),
        ]);

        if (summaryRes.data.success) {
          setSummary(summaryRes.data.summary);
        }
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.orders);
        }
      } catch (error) {
        console.error("Error fetching finance data:", error);
        toast.error("Failed to load finance data");
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchFinanceData();
    }
  }, [auth.token]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await axios.put(
        `http://localhost:8000/api/order/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );

      if (response.data.success) {
        toast.success("Order status updated!");
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <p>Loading finance data...</p>
      </div>
    );
  }

  const maxMonthlyRevenue = summary?.monthlyRevenue
    ? Math.max(...summary.monthlyRevenue.map((m) => m.revenue), 1)
    : 1;

  const maxProductQty = summary?.topProducts
    ? Math.max(...summary.topProducts.map((p) => p.quantity), 1)
    : 1;

  return (
    <div>
      <h4 className="mb-4">💰 Finances</h4>

      {/* Summary cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="text-muted">Total Revenue</h6>
              <h3 className="text-success">
                R{summary?.totalRevenue.toFixed(2) || "0.00"}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="text-muted">Total Orders</h6>
              <h3>{summary?.totalOrders || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="text-muted">This Month's Revenue</h6>
              <h3 className="text-primary">
                R{summary?.thisMonthRevenue.toFixed(2) || "0.00"}
              </h3>
              <small className="text-muted">
                {summary?.thisMonthOrders || 0} orders
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="text-muted">Avg. Order Value</h6>
              <h3>R{summary?.averageOrderValue.toFixed(2) || "0.00"}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue + Top Products */}
      <div className="row mb-4">
        <div className="col-md-7 mb-3">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              Revenue — Last 6 Months
            </div>
            <div className="card-body">
              {summary?.monthlyRevenue?.length > 0 ? (
                <div
                  className="d-flex align-items-end gap-3"
                  style={{ height: "180px" }}
                >
                  {summary.monthlyRevenue.map((m) => (
                    <div
                      key={m.month}
                      className="d-flex flex-column align-items-center flex-grow-1"
                    >
                      <div
                        className="bg-primary rounded-top w-100"
                        style={{
                          height: `${(m.revenue / maxMonthlyRevenue) * 140 || 2}px`,
                          minHeight: "2px",
                        }}
                        title={`R${m.revenue.toFixed(2)}`}
                      ></div>
                      <small className="text-muted mt-1">{m.month}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No revenue data yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-5 mb-3">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              Top Selling Products
            </div>
            <div className="card-body">
              {summary?.topProducts?.length > 0 ? (
                summary.topProducts.map((p) => (
                  <div key={p.name} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <small>{p.name}</small>
                      <small className="text-muted">
                        {p.quantity} sold — R{p.revenue.toFixed(2)}
                      </small>
                    </div>
                    <div className="bg-light rounded" style={{ height: "8px" }}>
                      <div
                        className="bg-success rounded"
                        style={{
                          height: "8px",
                          width: `${(p.quantity / maxProductQty) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">No sales data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="card">
        <div className="card-header bg-primary text-white">All Orders</div>
        <div className="card-body p-0">
          {orders.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No orders yet.</p>
            </div>
          ) : (
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>Buyer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.buyer?.name || "Unknown"}</strong>
                      <br />
                      <small className="text-muted">{order.buyer?.email}</small>
                    </td>
                    <td>
                      {order.items.map((item, i) => (
                        <div key={i}>
                          <small>
                            {item.quantity}x {item.name}
                          </small>
                        </div>
                      ))}
                    </td>
                    <td>
                      <strong>R{order.totalAmount.toFixed(2)}</strong>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        disabled={updatingOrderId === order._id}
                        style={{ minWidth: "120px" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <small>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinances;
