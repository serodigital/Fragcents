import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";

const Checkout = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [store, setStore] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");

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

  // Item total
  const getItemTotal = (item) => {
    return parsePrice(item.price) * (item.quantity || 1);
  };

  // Subtotal
  const subtotal = cart.reduce(
    (total, item) => total + getItemTotal(item),
    0
  );

  // Delivery
  const deliveryFee =
    subtotal >= 200 ? 0 : subtotal > 0 ? 50 : 0;

  // Final total
  const totalPrice = subtotal + deliveryFee;

  // Total number of products
  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  // Product image
  const getImageUrl = (item) => {
    if (item._id) {
      return `http://localhost:8000/api/product/image/${item._id}`;
    }

    return item.image || "/images/default.jpg";
  };

  // Secure checkout
  const handleSecureCheckout = () => {
    const auth = localStorage.getItem("auth");

    if (!auth) {
      navigate("/login");
      return;
    }

    navigate("/SecureCheckout");
  };

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>Your cart is empty</h3>

        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/shop")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* PAGE TITLE */}
      <h2 className="mb-4">
        Checkout
      </h2>

      <div className="row">

        {/* LEFT SIDE */}
        <div className="col-md-8">

          {/* PICK UP */}
          <div className="card mb-4">
            <div className="card-body">

              <h5 className="fw-bold mb-3">
                Pick Up
              </h5>

              <label className="form-label">
                Select a Store
              </label>

              <select
                className="form-select"
                value={store}
                onChange={(e) => setStore(e.target.value)}
              >
                <option value="">
                  Select a Store
                </option>

                <option value="pretoria">
                  Pretoria
                </option>

                <option value="johannesburg">
                  Johannesburg
                </option>

                <option value="cape-town">
                  Cape Town
                </option>
              </select>

            </div>
          </div>


          {/* DELIVERY */}
          <div className="card mb-4">
            <div className="card-body">

              <h5 className="fw-bold mb-3">
                Delivery
              </h5>

              <label className="form-label">
                Enter Postal Code
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Postal Code"
                value={postalCode}
                onChange={(e) =>
                  setPostalCode(e.target.value)
                }
              />

            </div>
          </div>


          {/* DISCOUNT */}
          <div className="card mb-4">
            <div className="card-body">

              <h5 className="fw-bold">
                Do you have a discount code?
              </h5>

              <div className="input-group mt-3">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) =>
                    setDiscountCode(e.target.value)
                  }
                />

                <button className="btn btn-outline-success">
                  Apply
                </button>

              </div>

            </div>
          </div>


          {/* GIFT CARD */}
          <div className="card mb-4">
            <div className="card-body">

              <h5 className="fw-bold">
                Do you have a Gift Card / wiCode?
              </h5>

              <div className="input-group mt-3">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Gift Card / wiCode"
                  value={giftCardCode}
                  onChange={(e) =>
                    setGiftCardCode(e.target.value)
                  }
                />

                <button className="btn btn-outline-success">
                  Apply
                </button>

              </div>

            </div>
          </div>


          {/* ORDER ITEMS */}
          <div className="card mb-4">

            <div className="card-body">

              <h5 className="fw-bold mb-3">
                Your Order
              </h5>

              {cart.map((item) => (

                <div
                  key={item.cartItemId}
                  className="d-flex justify-content-between align-items-center border-bottom py-3"
                >

                  {/* PRODUCT */}
                  <div className="d-flex align-items-center">

                    <img
                      src={getImageUrl(item)}
                      alt={item.name}
                      width="70"
                      height="70"
                      className="rounded me-3"
                      style={{
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.target.src =
                          "/images/default.jpg";
                      }}
                    />

                    <div>

                      <h6 className="mb-1">
                        {item.name}
                      </h6>

                      <small className="text-muted">
                        R{parsePrice(item.price).toFixed(2)}
                        {" "}×{" "}
                        {item.quantity || 1}
                      </small>

                    </div>

                  </div>


                  {/* ITEM TOTAL */}
                  <strong>
                    R{getItemTotal(item).toFixed(2)}
                  </strong>

                </div>

              ))}

            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="col-md-4">

          <div
            className="card shadow-sm sticky-top"
            style={{
              top: "20px",
              backgroundColor: "#f1f8f4",
              border: "none"
            }}
          >

            <div className="card-body">

              <h4 className="fw-bold mb-4">
                Order Summary
              </h4>


              {/* ITEMS */}
              <div className="d-flex justify-content-between mb-3">

                <span>
                  Subtotal ({totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"})
                </span>

                <strong>
                  R{subtotal.toFixed(2)}
                </strong>

              </div>


              {/* DELIVERY */}
              <div className="d-flex justify-content-between mb-3">

                <span>
                  Delivery

                  {subtotal >= 200 && (
                    <small className="text-success d-block">
                      Free delivery on orders over R200!
                    </small>
                  )}
                </span>

                <strong>
                  R{deliveryFee.toFixed(2)}
                </strong>

              </div>


              <hr />


              {/* TOTAL */}
              <div className="d-flex justify-content-between mb-4">

                <strong>
                  Order Total
                </strong>

                <strong>
                  R{totalPrice.toFixed(2)}
                </strong>

              </div>


              {/* CHECKOUT */}
              <button
                className="btn btn-success w-100"
                onClick={handleSecureCheckout}
              >
                Secure Checkout
              </button>


              {/* BACK */}
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