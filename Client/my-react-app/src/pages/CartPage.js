import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../Context/CartContext";

const CartPage = () => {
  const { cart, removeFromCart, updateCart, clearCart } = useCart();
  const [savedForLater, setSavedForLater] = useState(new Set()); // Track saved items

  const toggleSaveForLater = (cartItemId) => {
    setSavedForLater(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cartItemId)) {
        newSet.delete(cartItemId); // Remove from saved
      } else {
        newSet.add(cartItemId); // Add to saved
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

  // Helper to safely parse price to number
  const parsePrice = (price) => {
    if (typeof price === "number") {
      // If the number seems too large (like 15000 instead of 150), divide by 100
      if (price > 10000) {
        return price / 100;
      }
      return price;
    }
    if (typeof price === "string") {
      // Remove currency symbols and non-numeric characters except decimal point
      const cleanPrice = price.replace(/[^\d.-]/g, "");
      const num = parseFloat(cleanPrice) || 0;
      
      // If the parsed number seems too large, divide by 100
      if (num > 10000) {
        return num / 100;
      }
      return num;
    }
    return 0;
  };

  // Calculate item total (price × quantity)
  const getItemTotal = (item) => {
    return parsePrice(item.price) * (item.quantity || 1);
  };

  // Calculate subtotal (sum of all item totals)
  const subtotal = cart.reduce((total, item) => total + getItemTotal(item), 0);

  // Calculate delivery fee (free for orders over R200, otherwise R50)
  const deliveryFee = subtotal >= 200 ? 0 : subtotal > 0 ? 50 : 0;

  // Calculate final total
  const totalPrice = subtotal + deliveryFee;

  // Get total quantity of items
  const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  // Function to get the correct image URL
  const getImageUrl = (item) => {
    // If item has _id, use the API endpoint
    if (item._id) {
      return `http://localhost:8000/api/product/image/${item._id}`;
    }
    // Fallback to item.image or default
    return item.image || "/images/default.jpg";
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-4">
        <h3 className="mb-0 me-2">🛒 Shopping Cart:</h3>
        <p className="mt-4 ms-2">
          ({totalItems}
          <span className="ms-1">{totalItems === 1 ? 'item' : 'items'}</span>)
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
                  key={item.cartItemId} // Use unique cart item ID
                  className={`mb-3 p-3 border rounded ${
                    index === 0 ? "border-top" : ""
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    {/* Left: Image and Name */}
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
                            console.log(`Image failed for item ${item._id}:`, e.target.src);
                            e.target.src = "/images/default.jpg";
                          }}
                          onLoad={() => {
                            console.log(`Image loaded for ${item.name}:`, getImageUrl(item));
                          }}
                        />
                        {/* Show item ID for debugging */}
                        {process.env.NODE_ENV === 'development' && (
                          <small className="text-muted d-block text-center">
                            {item._id?.slice(-4)}
                          </small>
                        )}
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

                    {/* Right: Quantity + Total Price */}
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

                  {/* Save and Remove buttons */}
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <div className="d-flex">
                      <button 
                        className={`btn btn-sm me-2 ${
                          savedForLater.has(item.cartItemId) 
                            ? 'btn-danger text-white' 
                            : 'btn-outline-primary'
                        }`}
                        onClick={() => toggleSaveForLater(item.cartItemId)}
                      >
                        {savedForLater.has(item.cartItemId) ? '❤️ Saved!' : '🤍 Save for Later'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.cartItemId)}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                    {/* Show save status */}
                    <div className="d-flex align-items-center">
                      {savedForLater.has(item.cartItemId) && (
                        <small className="text-danger me-2">
                          ⭐ Saved for later
                        </small>
                      )}
                      <small className="text-muted">
                        Item #{index + 1}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
              
              {cart.length >= 3 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button className="btn btn-outline-danger" onClick={clearCart}>
                    🗑️ Clear All Items
                  </button>
                  <small className="text-muted">
                    {cart.length} line items in cart
                  </small>
                </div>
              )}

              {/* Saved for Later Section */}
              {savedForLater.size > 0 && (
                <div className="mt-5">
                  <h5 className="mb-3 text-danger">❤️ Saved for Later ({savedForLater.size} items)</h5>
                  <div className="border-top pt-3">
                    {cart
                      .filter(item => savedForLater.has(item.cartItemId))
                      .map((item, index) => (
                        <div key={item.cartItemId} className="mb-3 p-3 border rounded bg-light">
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
                                  <span className="badge bg-danger small">Saved</span>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center">
                              <small className="text-muted me-3">Qty: {item.quantity}</small>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => toggleSaveForLater(item.cartItemId)}
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

        {/* Payment Summary */}
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
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
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
                        <small className="text-success d-block">Free delivery on orders over R200!</small>
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
                <button className="btn btn-success w-100 mt-2">
                  Proceed to Checkout
                </button>
                
                <Link to="/shop" className="btn btn-outline-secondary w-100 mt-2">
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