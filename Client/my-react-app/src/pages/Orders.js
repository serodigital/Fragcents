
import React, { useEffect, useState } from "react";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      // Get logged-in user information
      const auth = JSON.parse(localStorage.getItem("auth"));

      if (!auth || !auth.user) {
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }

      const userId = auth.user._id || auth.user.id;

      if (!userId) {
        setError("User information is missing.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/order/user/${userId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load orders."
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setError(error.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading your orders...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <h3>My Orders</h3>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Orders</h2>
          <p className="text-muted mb-0">
            View your current and previous orders.
          </p>
        </div>

        <button
          className="btn btn-outline-dark"
          onClick={fetchOrders}
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <h4>No orders yet</h4>

          <p className="text-muted">
            You have not placed any orders yet.
          </p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              className="card mb-4 shadow-sm"
              key={order._id}
            >
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>
                    {order.orderNumber}
                  </strong>

                  <div className="text-muted small">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </div>
                </div>

                <span
                  className={`badge ${
                    order.orderStatus === "delivered"
                      ? "bg-success"
                      : order.orderStatus === "cancelled"
                      ? "bg-danger"
                      : "bg-warning text-dark"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className="card-body">

                <h6>Items Ordered</h6>

                {order.products.map((product, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between border-bottom py-2"
                  >
                    <div>
                      <strong>{product.name}</strong>

                      <div className="text-muted small">
                        Quantity: {product.quantity}
                      </div>
                    </div>

                    <div>
                      R
                      {(
                        product.price *
                        product.quantity
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div className="row mt-3">

                  <div className="col-md-6">
                    <h6>Payment</h6>

                    <p className="mb-1">
                      <strong>Method:</strong>{" "}
                      {order.paymentMethod}
                    </p>

                    <p className="mb-1">
                      <strong>Status:</strong>{" "}
                      {order.paymentStatus}
                    </p>
                  </div>

                  <div className="col-md-6 text-md-end">
                    <p className="mb-1">
                      Subtotal: R
                      {order.subtotal.toFixed(2)}
                    </p>

                    <p className="mb-1">
                      Delivery: R
                      {order.deliveryFee.toFixed(2)}
                    </p>

                    <h5>
                      Total: R
                      {order.totalAmount.toFixed(2)}
                    </h5>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default OrderPage;

