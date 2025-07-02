import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import "./PurchaseHistory.css";

const PurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate(); // ✅ Initialize navigate

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
  }, []);

  return (
    <div className="purchase-history container py-4">
      <nav className="navbar navbar-light bg-light mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/shopping')}>
          ⬅ Back
        </button>
        <h3 className="mx-auto">Purchase History</h3>
      </nav>

      {orders.length === 0 ? (
        <div className="text-center">
          <h4>No purchases found.</h4>
          <p className="text-muted">Your recent purchases will appear here.</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order, index) => (
            <div key={index} className="order-card card mb-3 shadow-sm">
              <div className="row g-0 align-items-center">
                <div className="col-md-3">
                  <img src={order.image} className="img-fluid rounded-start" alt={order.name} />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <h5 className="card-title">{order.name}</h5>
                    <p className="card-text mb-1"><strong>Category:</strong> {order.category}</p>
                    <p className="card-text mb-1"><strong>Gender:</strong> {order.gender}</p>
                    <p className="card-text mb-1"><strong>Price:</strong> R{order.price.toFixed(2)}</p>
                    <p className="card-text text-muted"><small>Purchased on: {order.date}</small></p>
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

export default PurchaseHistory;
