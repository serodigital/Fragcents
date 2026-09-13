import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/Auth";

const CartPage = () => {
  const { cart, removeFromCart, updateCart, clearCart } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [savedForLater, setSavedForLater] = useState(new Set());
  const [checkingOut, setCheckingOut] = useState(false);

  const toggleSaveForLater = (cartItemId) => {
    setSavedForLater((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cartItemId)) {
        newSet.delete(cartItemId);
      } else {
        newSet.add(cartItemId);
      }
      return newSet;
    });
  };

  const incrementQuantity = (cartItemId) => {
    const item = cart.find((cartItem) => cartItem.cartItemId === cartItemId);
    if (item) {
      updateCart(cartItemId, item.quantity + 1);
    }
  };

  const decrementQuantity = (cartItemId) => {
    const item = cart.find((cartItem) => cartItem.cartItemId === cartItemId);
    if (item && item.quantity > 1) {
      updateCart(cartItemId, item.quantity - 1);
    }
  };

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
      return `http://localhost:8000/api/product/image/${item._id}`;
    }
    return item.image || "/images/default.jpg";
  };

  // Handle checkout - creates a real order in the database
  const handleCheckout = async () => {
    if (!auth.token) {
      toast.error("Please log in to checkout");
      navigate("/login");
      return;
    }

    if (cart.length === 0) return;

    setCheckingOut(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item._id,
        name: item.name,
        price: parsePrice(item.price),
        quantity: item.quantity || 1,
      }));

      const response = await axios.post(
        "http://localhost:8000/api/order",
        {
          items: orderItems,
          totalAmount: totalPrice,
          deliveryFee,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );

      if (response.data.success) {
        toast.success("Order placed successfully! 🎉");
        clearCart();
        navigate("/dashboard");
      } else {
        toast.error("Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong placing your order");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-4">
        <h3 className="mb-0 me-2">🛒 Shopping Cart:</h3>
        <p className="mt-4 ms-2">
          ({totalItems}
          <span className="ms-1">{totalItems === 1 ? "item" : "items"}</span>)
        </p>
      </div>

      <div className="row">
        <div className="col-md-8 mb-4">
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="mb-3">Your cart is empty</h4>
              <Link to="/shop">
                <button
                  className="btn btn-primary"
                  style={{
                    transition: "all 0.2s",
                  }}
                >
                  ⬅︎ Continue Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div>
              {cart.map((item, index) => (
                <div
                  key={item.cartItemId}
                  className={`mb-3 p-3 border rounded ${
                    index === 0 ? "border-top" : ""
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <img
                          src={getImageUrl(item)}
                          alt={item.name}
                          width="80"
                          height="80"
                          style={{ objectFit: "cover" }}
                          className="rounded shadow-sm"
                          onError={(e) => {
                            e.target.src = "/images/default.jpg";
                          }}
                        />
                      </div>
                      <div>
                        <h5 className="mb-1">{item.name}</h5>
                        <small className="text-muted">
                          R{parsePrice(item.price).toFixed(2)} each
                        </small>
                        {item.category && (
                          <div>
                            <span className="badge bg-secondary small">
                              {item.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex align-items-center">
                      <div
                        className="input-group input-group-sm me-3 border rounded"
                        style={{ width: "100px" }}
                      >
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => decrementQuantity(item.cartItemId)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-control text-center border-0"
                          value={item.quantity || 1}
                          min="1"
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => incrementQuantity(item.cartItemId)}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-end">
                        <p className="mb-0 fw-bold">
                          R{getItemTotal(item).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <div className="d-flex">
                      <button
                        className={`btn btn-sm me-2 ${
                          savedForLater.has(item.cartItemId)
                            ? "btn-danger text-white"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => toggleSaveForLater(item.cartItemId)}
                      >
                        {savedForLater.has(item.cartItemId)
                          ? "❤️ Saved!"
                          : "🤍 Save for Later"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.cartItemId)}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                    <div className="d-flex align-items-center">
                      {savedForLater.has(item.cartItemId) && (
                        <small className="text-danger me-2">
                          ⭐ Saved for later
                        </small>
                      )}
                      <small className="text-muted">Item #{index + 1}</small>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length >= 3 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button
                    className="btn btn-outline-danger"
                    onClick={clearCart}
                  >
                    🗑️ Clear All Items
                  </button>
                  <small className="text-muted">
                    {cart.length} line items in cart
                  </small>
                </div>
              )}

              {savedForLater.size > 0 && (
                <div className="mt-5">
                  <h5 className="mb-3 text-danger">
                    ❤️ Saved for Later ({savedForLater.size} items)
                  </h5>
                  <div className="border-top pt-3">
                    {cart
                      .filter((item) => savedForLater.has(item.cartItemId))
                      .map((item, index) => (
                        <div
                          key={item.cartItemId}
                          className="mb-3 p-3 border rounded bg-light"
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <img
                                src={getImageUrl(item)}
                                alt={item.name}
                                width="60"
                                height="60"
                                style={{ objectFit: "cover" }}
                                className="rounded shadow-sm me-3"
                                onError={(e) => {
                                  e.target.src = "/images/default.jpg";
                                }}
                              />
                              <div>
                                <h6 className="mb-1">{item.name}</h6>
                                <small className="text-muted">
                                  R{parsePrice(item.price).toFixed(2)} each
                                </small>
                                <div>
                                  <span className="badge bg-danger small">
                                    Saved
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center">
                              <small className="text-muted me-3">
                                Qty: {item.quantity}
                              </small>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() =>
                                  toggleSaveForLater(item.cartItemId)
                                }
                              >
                                ⬅️ Move to Cart
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeFromCart(item.cartItemId)}
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="col-md-4 mb-3">
            <div
              className="card shadow-sm"
              style={{ backgroundColor: "#f1f8f4", border: "none" }}
            >
              <div className="card-body">
                <h4 className="card-title mt-2">💳 Payment Summary</h4>
                <ul className="list-unstyled">
                  <li className="d-flex justify-content-between pt-3">
                    <span>
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"})
                    </span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </li>
                  <li className="d-flex justify-content-between pt-3">
                    <span>Total Line Items</span>
                    <span>{cart.length}</span>
                  </li>
                  <li className="d-flex justify-content-between mb-4 pt-3">
                    <span>
                      Delivery
                      {subtotal >= 200 && (
                        <small className="text-success d-block">
                          Free delivery on orders over R200!
                        </small>
                      )}
                    </span>
                    <strong>R{deliveryFee.toFixed(2)}</strong>
                  </li>
                  <li className="d-flex justify-content-between mb-4 border-top border-bottom border-solid border-black pt-3 pb-3">
                    <span>
                      <strong>Order Total</strong>
                    </span>
                    <strong>R{totalPrice.toFixed(2)}</strong>
                  </li>
                </ul>
                <button
                  className="btn btn-success w-100 mt-2"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? "Placing Order..." : "Proceed to Checkout"}
                </button>

                <Link
                  to="/shop"
                  className="btn btn-outline-secondary w-100 mt-2"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
