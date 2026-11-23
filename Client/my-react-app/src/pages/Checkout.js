
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";

const API_URL = process.env.REACT_APP_API_URL || "";

const Checkout = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  // Same price handling as your Cart
  const parsePrice = (price) => {
    if (typeof price === "number") {
      if (price > 10000) {
        return price / 100;
      }
      return price;
    }

    if (typeof price === "string") {
      const cleanPrice = price.replace(/[^\d.-]/g, "");
      const num = parseFloat(cleanPrice) || 0;

      if (num > 10000) {
        return num / 100;
      }

      return num;
    }

    return 0;
  };

  const getItemTotal = (item) => {
    return parsePrice(item.price) * (item.quantity || 1);
  };

  const subtotal = cart.reduce((total, item) => total + getItemTotal(item), 0);

  const deliveryFee = subtotal >= 200 ? 0 : subtotal > 0 ? 50 : 0;

  const totalPrice = subtotal + deliveryFee;

  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  const getImageUrl = (item) => {
    if (item._id) {
      return `${API_URL}/api/product/image/${item._id}`;
    }

    return item.image || "/images/default.jpg";
  };

  const handleSecureCheckout = () => {
    const auth = localStorage.getItem("auth");

    if (!auth) {
      navigate("/login");
      return;
    }

    navigate("/SecureCheckout");
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h3 mb-3">Your cart is empty</h1>

        <button
          className="btn btn-primary px-4"
          onClick={() => navigate("/shop")}
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4 mb-4">
      <h1 className="h2 mb-4">Checkout</h1>

      <div className="row">
        {/* LEFT SIDE: order items */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3">Your Order</h2>

              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="d-flex justify-content-between align-items-center border-bottom py-3"
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={getImageUrl(item)}
                      alt={item.name}
                      width="70"
                      height="70"
                      className="rounded me-3"
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "/images/default.jpg";
                      }}
                    />

                    <div>
                      <h6 className="mb-1">{item.name}</h6>
                      <small className="text-muted">
                        R{parsePrice(item.price).toFixed(2)} ×{" "}
                        {item.quantity || 1}
                      </small>
                    </div>
                  </div>

                  <strong>R{getItemTotal(item).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: summary */}
        <div className="col-md-4">
          <div
            className="card sd-summary-card shadow-sm sticky-top"
            style={{ top: "20px" }}
          >
            <div className="card-body">
              <h2 className="h4 fw-bold mb-4">Order Summary</h2>

              <div className="d-flex justify-content-between mb-3">
                <span>
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
                <strong>R{subtotal.toFixed(2)}</strong>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>
                  Delivery
                  {subtotal >= 200 && (
                    <small className="text-success d-block">
                      Free delivery on orders over R200!
                    </small>
                  )}
                </span>
                <strong>R{deliveryFee.toFixed(2)}</strong>
              </div>

                  <strong>
                    R{totalPrice.toFixed(2)}
                  </strong>
                </div>

              <div className="d-flex justify-content-between mb-4">
                <strong>Order Total</strong>
                <strong>R{totalPrice.toFixed(2)}</strong>
              </div>

              <button
                className="btn btn-warning w-100"
                onClick={handleSecureCheckout}
              >
                Secure Checkout
              </button>

              <button
                className="btn btn-outline-secondary w-100 mt-2"
                onClick={() => navigate("/cart")}
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
