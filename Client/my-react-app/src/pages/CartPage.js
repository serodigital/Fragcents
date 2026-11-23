
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../Context/CartContext";

const CartPage = () => {
  const { cart, removeFromCart, updateCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [savedForLater, setSavedForLater] = useState(new Set());

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
    const item = cart.find(
      (cartItem) => cartItem.cartItemId === cartItemId
    );

    if (!item) {
      console.error("Cart item not found:", cartItemId);
      return;
    }

    const currentQuantity = Number(item.quantity) || 1;
    const availableStock = Number(item.stock);

    if (!Number.isFinite(availableStock)) {
      toast.error("Stock information is unavailable.");
      return;
    }

    if (availableStock <= 0) {
      toast.error("This item is currently out of stock.");
      return;
    }

    if (currentQuantity >= availableStock) {
      toast.error(`Only ${availableStock} item(s) available in stock.`);
      return;
    }

    updateCart(cartItemId, currentQuantity + 1);
  };

  const decrementQuantity = (cartItemId) => {
    const item = cart.find(
      (cartItem) => cartItem.cartItemId === cartItemId
    );

    if (!item) return;

    const currentQuantity = Number(item.quantity) || 1;

    if (currentQuantity > 1) {
      updateCart(cartItemId, currentQuantity - 1);
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

  const subtotal = cart.reduce(
    (total, item) => total + getItemTotal(item),
    0
  );

  const deliveryFee =
    subtotal >= 200 ? 0 : subtotal > 0 ? 50 : 0;

  const totalPrice = subtotal + deliveryFee;

  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const getImageUrl = (item) => {
    if (item._id) {
      return `/api/product/image/${item._id}`;
    }

    return item.image || "/images/default.jpg";
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h3 mb-2">Your cart is empty</h1>
        <p className="text-muted mb-4">
          Looks like you haven't added any fragrances yet.
        </p>
        <Link to="/shop" className="btn btn-primary px-4">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex align-items-baseline gap-2 mb-4">
        <h1 className="h3 mb-0">Shopping Cart</h1>
        <span className="text-muted">
          ({totalItems} {totalItems === 1 ? "item" : "items"})
        </span>
      </div>

      <div className="row">
        <div className="col-md-8 mb-4">
          <div>
            {cart.map((item, index) => (
              <div
                key={item.cartItemId}
                className={`mb-3 p-3 border rounded bg-white ${
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
                            {typeof item.category === "string"
                              ? item.category
                              : item.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* CLEAR CART */}
                  {cart.length >= 3 && (
                    <div className="fc-cart-clear-row">

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

                      <span className="fc-cart-line-count">
                        {cart.length} line items in cart
                      </span>

                    </div>
                    <div className="text-end">
                      <p className="mb-0 fw-bold">
                        R{getItemTotal(item).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center mt-3">
                  <button
                    className={`btn btn-sm me-2 ${
                      savedForLater.has(item.cartItemId)
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => toggleSaveForLater(item.cartItemId)}
                  >
                    {savedForLater.has(item.cartItemId)
                      ? "Saved"
                      : "Save for later"}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeFromCart(item.cartItemId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {cart.length >= 3 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button className="btn btn-outline-danger" onClick={clearCart}>
                  Clear all items
                </button>
                <small className="text-muted">
                  {cart.length} line items in cart
                </small>
              </div>
            )}

            {savedForLater.size > 0 && (
              <div className="mt-5">
                <h2 className="h5 mb-3">
                  Saved for later ({savedForLater.size})
                </h2>
                <div className="border-top pt-3">
                  {cart
                    .filter((item) => savedForLater.has(item.cartItemId))
                    .map((item) => (
                      <div
                        key={item.cartItemId}
                        className="mb-3 p-3 border rounded bg-white"
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
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <small className="text-muted me-3">
                              Qty: {item.quantity}
                            </small>
                            <button
                              className="btn btn-sm btn-primary me-2"
                              onClick={() =>
                                toggleSaveForLater(item.cartItemId)
                              }
                            >
                              Move to cart
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFromCart(item.cartItemId)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card sd-summary-card shadow-sm">
            <div className="card-body">
              <h2 className="h4 card-title mt-2">Payment Summary</h2>
              <ul className="list-unstyled">
                <li className="d-flex justify-content-between pt-3">
                  <span>
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}
                    )
                  </span>
                  <span>R{subtotal.toFixed(2)}</span>
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
                <li className="d-flex justify-content-between mb-4 border-top pt-3">
                  <span>
                    <strong>Order Total</strong>
                  </span>
                  <strong>R{totalPrice.toFixed(2)}</strong>
                </li>
              </ul>
              <button
                className="btn btn-warning w-100 mt-2"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>

              <Link to="/shop" className="btn btn-outline-secondary w-100 mt-2">
                Continue Shopping
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
