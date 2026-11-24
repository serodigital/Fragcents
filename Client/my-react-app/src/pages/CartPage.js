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
    const item = cart.find((cartItem) => cartItem.cartItemId === cartItemId);

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
    const item = cart.find((cartItem) => cartItem.cartItemId === cartItemId);

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

  const subtotal = cart.reduce((total, item) => total + getItemTotal(item), 0);

  const deliveryFee = subtotal >= 200 ? 0 : subtotal > 0 ? 50 : 0;

  const totalPrice = subtotal + deliveryFee;

  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
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

  const savedItems = cart.filter((item) => savedForLater.has(item.cartItemId));

  return (
    <div className="frag-cart">
      <style>{`
        .frag-cart {
          --fc-navy: #957a4a;
          --fc-cream: #f7f5f0;
          --fc-gold: #b69b78;
          --fc-muted: #777f89;
          background: var(--fc-cream);
          min-height: 75vh;
          padding: 55px 20px 70px;
          color: var(--fc-navy);
        }

        .frag-cart * {
          box-sizing: border-box;
        }

        .fc-cart-page {
          max-width: 1180px;
          margin: 0 auto;
        }

        .fc-cart-header {
          margin-bottom: 32px;
        }

        .fc-cart-eyebrow {
          color: var(--fc-gold);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 9px;
        }

        .fc-cart-header h2 {
          color: var(--fc-navy);
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 9px;
        }

        .fc-cart-header p {
          color: var(--fc-muted);
          font-size: 14px;
          margin: 0;
        }

        .fc-cart-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(300px, .85fr);
          gap: 28px;
          align-items: start;
        }

        .fc-cart-left {
          min-width: 0;
        }

        .fc-cart-card {
          background: #fff;
          border: 1px solid #e9e5de;
          border-radius: 9px;
          overflow: hidden;
        }

        .fc-cart-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 22px 25px;
          border-bottom: 1px solid #eeeae4;
        }

        .fc-cart-card-header h5 {
          color: var(--fc-navy);
          font-size: 17px;
          font-weight: 700;
          margin: 0;
        }

        .fc-cart-count {
          color: var(--fc-muted);
          font-size: 12px;
        }

        .fc-cart-items {
          padding: 0 25px;
        }

        .fc-cart-item {
          padding: 23px 0;
          border-bottom: 1px solid #eeeae4;
        }

        .fc-cart-item:last-child {
          border-bottom: none;
        }

        .fc-cart-item-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
        }

        .fc-cart-product {
          display: flex;
          align-items: center;
          gap: 17px;
          min-width: 0;
        }

        .fc-cart-image {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          object-fit: cover;
          border-radius: 6px;
          background: #f5f3ef;
          border: 1px solid #eeeae4;
        }

        .fc-cart-product-info {
          min-width: 0;
        }

        .fc-cart-product-name {
          color: var(--fc-navy);
          font-size: 15px;
          font-weight: 700;
          line-height: 1.5;
          margin: 0 0 7px;
        }

        .fc-cart-price {
          color: var(--fc-muted);
          font-size: 13px;
          margin: 0 0 9px;
        }

        .fc-cart-category {
          display: inline-block;
          padding: 4px 9px;
          border-radius: 3px;
          background: #f2eee7;
          color: #75634e;
          font-size: 10px;
          font-weight: 600;
        }

        .fc-cart-quantity-area {
          display: flex;
          align-items: center;
          gap: 22px;
          flex-shrink: 0;
        }

        .fc-cart-quantity {
          display: flex;
          align-items: center;
          border: 1px solid #dedbd4;
          border-radius: 5px;
          overflow: hidden;
          height: 36px;
        }

        .fc-cart-quantity button {
          width: 32px;
          height: 35px;
          border: none;
          background: #fff;
          color: var(--fc-navy);
          font-size: 17px;
          transition: .2s ease;
        }

        .fc-cart-quantity button:hover:not(:disabled) {
          background: #f2eee7;
        }

        .fc-cart-quantity button:disabled {
          color: #c3c3c3;
          cursor: not-allowed;
        }

        .fc-cart-quantity input {
          width: 35px;
          height: 35px;
          border: none;
          outline: none;
          background: white;
          color: var(--fc-navy);
          text-align: center;
          font-size: 13px;
          font-weight: 600;
        }

        .fc-cart-item-total {
          color: var(--fc-navy);
          font-size: 14px;
          font-weight: 700;
          min-width: 75px;
          text-align: right;
          white-space: nowrap;
        }

        .fc-cart-item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 17px;
          padding-left: 117px;
        }

        .fc-cart-action-group {
          display: flex;
          align-items: center;
          gap: 17px;
          flex-wrap: wrap;
        }

        .fc-cart-action {
          padding: 0;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: .2s ease;
        }

        .fc-cart-save {
          color: #8b755b;
        }

        .fc-cart-save:hover {
          color: var(--fc-navy);
        }

        .fc-cart-save.is-saved {
          color: #a65d64;
        }

        .fc-cart-remove {
          color: #a65d64;
        }

        .fc-cart-remove:hover {
          color: #7f343c;
        }

        .fc-cart-item-number {
          color: #9a9da1;
          font-size: 11px;
          white-space: nowrap;
        }

        .fc-cart-clear-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 18px 0 3px;
        }

        .fc-cart-clear {
          border: none;
          background: transparent;
          color: #a65d64;
          font-size: 12px;
          font-weight: 650;
          padding: 0;
        }

        .fc-cart-clear:hover {
          color: #7f343c;
        }

        .fc-cart-line-count {
          color: var(--fc-muted);
          font-size: 11px;
        }

        .fc-saved-section {
          margin-top: 25px;
        }

        .fc-saved-heading {
          color: var(--fc-navy);
          font-size: 17px;
          font-weight: 700;
          margin: 0 0 15px;
        }

        .fc-saved-card {
          background: #fff;
          border: 1px solid #e9e5de;
          border-radius: 8px;
          padding: 18px;
          margin-bottom: 12px;
        }

        .fc-saved-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .fc-saved-product {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .fc-saved-image {
          width: 68px;
          height: 68px;
          object-fit: cover;
          flex-shrink: 0;
          border-radius: 5px;
          border: 1px solid #eeeae4;
          background: #f5f3ef;
        }

        .fc-saved-product h6 {
          color: var(--fc-navy);
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 6px;
        }

        .fc-saved-product p {
          color: var(--fc-muted);
          font-size: 12px;
          margin: 0 0 6px;
        }

        .fc-saved-label {
          color: #a65d64;
          font-size: 10px;
          font-weight: 650;
        }

        .fc-saved-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .fc-saved-quantity {
          color: var(--fc-muted);
          font-size: 11px;
          white-space: nowrap;
        }

        .fc-saved-move {
          padding: 8px 11px;
          background: var(--fc-navy);
          border: 1px solid var(--fc-navy);
          border-radius: 4px;
          color: white;
          font-size: 11px;
          font-weight: 600;
          transition: .2s ease;
        }

        .fc-saved-move:hover {
          background: #243f5e;
        }

        .fc-saved-remove {
          padding: 7px 0;
          border: none;
          background: transparent;
          color: #a65d64;
          font-size: 11px;
          font-weight: 600;
        }

        .fc-cart-summary {
          position: sticky;
          top: 20px;
        }

        .fc-summary-body {
          padding: 25px;
        }

        .fc-summary-title {
          color: var(--fc-navy);
          font-size: 19px;
          font-weight: 700;
          margin: 0 0 7px;
        }

        .fc-summary-subtitle {
          color: var(--fc-muted);
          font-size: 12px;
          margin-bottom: 25px;
        }

        .fc-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 19px;
          color: #606975;
          font-size: 13px;
        }

        .fc-summary-row strong {
          color: var(--fc-navy);
          font-weight: 650;
          white-space: nowrap;
        }

        .fc-free-delivery {
          display: block;
          color: #54836b;
          font-size: 11px;
          margin-top: 5px;
        }

        .fc-summary-divider {
          border: 0;
          border-top: 1px solid #eae6df;
          margin: 22px 0;
        }

        .fc-summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .fc-summary-total span {
          color: var(--fc-navy);
          font-size: 15px;
          font-weight: 700;
        }

        .fc-summary-total strong {
          color: var(--fc-navy);
          font-size: 23px;
          font-weight: 750;
          white-space: nowrap;
        }

        .fc-cart-checkout-btn {
          display: block;
          width: 100%;
          padding: 15px 18px;
          background: var(--fc-navy);
          color: white;
          border: 1px solid var(--fc-navy);
          border-radius: 5px;
          font-size: 13px;
          font-weight: 650;
          letter-spacing: .3px;
          transition: .2s ease;
        }

        .fc-cart-checkout-btn:hover {
          background: #243f5e;
          border-color: #243f5e;
        }

        .fc-cart-continue-btn {
          display: block;
          width: 100%;
          padding: 13px 18px;
          margin-top: 10px;
          background: white;
          color: var(--fc-navy);
          border: 1px solid #d9d5cd;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          transition: .2s ease;
        }

        .fc-cart-continue-btn:hover {
          background: #f7f5f0;
          color: var(--fc-navy);
        }

        .fc-cart-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: var(--fc-muted);
          font-size: 11px;
          margin-top: 20px;
          text-align: center;
        }

        .fc-cart-empty {
          max-width: 560px;
          margin: 0 auto;
          padding: 55px 30px;
          background: white;
          border: 1px solid #e9e5de;
          border-radius: 10px;
          text-align: center;
        }

        .fc-cart-empty-icon {
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 22px;
          background: #f2eee7;
          border-radius: 50%;
          font-size: 30px;
        }

        .fc-cart-empty h3 {
          color: var(--fc-navy);
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .fc-cart-empty p {
          color: var(--fc-muted);
          font-size: 13px;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .fc-cart-empty-btn {
          display: inline-block;
          padding: 13px 23px;
          background: var(--fc-navy);
          color: white;
          border: 1px solid var(--fc-navy);
          border-radius: 5px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: .2s ease;
        }

        .fc-cart-empty-btn:hover {
          background: #243f5e;
          color: white;
        }

        @media (max-width: 900px) {
          .fc-cart-layout {
            grid-template-columns: minmax(0, 1fr) 300px;
            gap: 18px;
          }

          .fc-cart-quantity-area {
            gap: 12px;
          }

          .fc-cart-item-actions {
            padding-left: 0;
          }

          .fc-saved-main {
            align-items: flex-start;
            flex-direction: column;
          }

          .fc-saved-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }

        @media (max-width: 767px) {
          .frag-cart {
            padding: 40px 15px;
          }

          .fc-cart-header h2 {
            font-size: 27px;
          }

          .fc-cart-layout {
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .fc-cart-summary {
            position: static;
          }

          .fc-cart-card-header {
            padding: 19px;
          }

          .fc-cart-items {
            padding: 0 19px;
          }

          .fc-cart-image {
            width: 76px;
            height: 76px;
          }

          .fc-cart-product {
            gap: 12px;
          }

          .fc-cart-item-main {
            align-items: flex-start;
            flex-direction: column;
          }

          .fc-cart-quantity-area {
            width: 100%;
            justify-content: space-between;
          }

          .fc-cart-item-actions {
            margin-top: 14px;
          }

          .fc-saved-card {
            padding: 14px;
          }

          .fc-saved-actions {
            flex-wrap: wrap;
            justify-content: flex-start;
          }
        }

        @media (max-width: 380px) {
          .fc-cart-image {
            width: 64px;
            height: 64px;
          }

          .fc-cart-product-name {
            font-size: 13px;
          }

          .fc-cart-action-group {
            gap: 12px;
          }

          .fc-cart-item-number {
            display: none;
          }

          .fc-summary-body {
            padding: 20px;
          }
        }
      `}</style>

      <div className="fc-cart-page">
        {/* PAGE HEADER */}
        <div className="fc-cart-header">
          <div className="fc-cart-eyebrow">FragCents Shopping</div>

          <h2>Shopping Cart</h2>

          <p>Review your selected products before proceeding to checkout.</p>
        </div>

        {cart.length === 0 ? (
          /* EMPTY CART */
          <div className="fc-cart-empty">
            <div className="fc-cart-empty-icon">🛍</div>

            <h3>Your cart is empty</h3>

            <p>
              You haven't added any products to your cart yet. Explore our
              collection and find something you love.
            </p>

            <Link to="/shop" className="fc-cart-empty-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="fc-cart-layout">
            {/* LEFT: CART PRODUCTS */}
            <div className="fc-cart-left">
              <div className="fc-cart-card">
                <div className="fc-cart-card-header">
                  <h5>Your Items</h5>

                  <span className="fc-cart-count">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="fc-cart-items">
                  {cart.map((item, index) => (
                    <div key={item.cartItemId} className="fc-cart-item">
                      <div className="fc-cart-item-main">
                        {/* PRODUCT INFORMATION */}
                        <div className="fc-cart-product">
                          <img
                            src={getImageUrl(item)}
                            alt={item.name}
                            className="fc-cart-image"
                            onError={(e) => {
                              e.target.src = "/images/default.jpg";
                            }}
                          />

                          <div className="fc-cart-product-info">
                            <h6 className="fc-cart-product-name">
                              {item.name}
                            </h6>

                            <p className="fc-cart-price">
                              R{parsePrice(item.price).toFixed(2)} each
                            </p>

                            {item.category && (
                              <span className="fc-cart-category">
                                {typeof item.category === "string"
                                  ? item.category
                                  : item.category.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* QUANTITY AND TOTAL */}
                        <div className="fc-cart-quantity-area">
                          <div className="fc-cart-quantity">
                            <button
                              type="button"
                              onClick={() => decrementQuantity(item.cartItemId)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <input
                              type="number"
                              value={item.quantity || 1}
                              min="1"
                              readOnly
                              aria-label="Product quantity"
                            />

                            <button
                              type="button"
                              onClick={() => incrementQuantity(item.cartItemId)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div className="fc-cart-item-total">
                            R{getItemTotal(item).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* PRODUCT ACTIONS */}
                      <div className="fc-cart-item-actions">
                        <div className="fc-cart-action-group">
                          <button
                            type="button"
                            className={`fc-cart-action fc-cart-save ${
                              savedForLater.has(item.cartItemId)
                                ? "is-saved"
                                : ""
                            }`}
                            onClick={() => toggleSaveForLater(item.cartItemId)}
                          >
                            {savedForLater.has(item.cartItemId)
                              ? "♥ Saved for Later"
                              : "♡ Save for Later"}
                          </button>

                          <button
                            type="button"
                            className="fc-cart-action fc-cart-remove"
                            onClick={() => removeFromCart(item.cartItemId)}
                          >
                            Remove
                          </button>
                        </div>

                        <span className="fc-cart-item-number">
                          Item #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* CLEAR CART */}
                  {cart.length >= 3 && (
                    <div className="fc-cart-clear-row">
                      <button
                        type="button"
                        className="fc-cart-clear"
                        onClick={clearCart}
                      >
                        Clear All Items
                      </button>

                      <span className="fc-cart-line-count">
                        {cart.length} line items in cart
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SAVED FOR LATER */}
              {savedItems.length > 0 && (
                <div className="fc-saved-section">
                  <h5 className="fc-saved-heading">
                    Saved for Later ({savedItems.length})
                  </h5>

                  {savedItems.map((item) => (
                    <div key={item.cartItemId} className="fc-saved-card">
                      <div className="fc-saved-main">
                        <div className="fc-saved-product">
                          <img
                            src={getImageUrl(item)}
                            alt={item.name}
                            className="fc-saved-image"
                            onError={(e) => {
                              e.target.src = "/images/default.jpg";
                            }}
                          />

                          <div>
                            <h6>{item.name}</h6>

                            <p>R{parsePrice(item.price).toFixed(2)} each</p>

                            <span className="fc-saved-label">
                              Saved for later
                            </span>
                          </div>
                        </div>

                        <div className="fc-saved-actions">
                          <span className="fc-saved-quantity">
                            Qty: {item.quantity}
                          </span>

                          <button
                            type="button"
                            className="fc-saved-move"
                            onClick={() => toggleSaveForLater(item.cartItemId)}
                          >
                            Move to Cart
                          </button>

                          <button
                            type="button"
                            className="fc-saved-remove"
                            onClick={() => removeFromCart(item.cartItemId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div className="fc-cart-summary">
              <div className="fc-cart-card">
                <div className="fc-summary-body">
                  <h4 className="fc-summary-title">Order Summary</h4>

                  <p className="fc-summary-subtitle">
                    A breakdown of your purchase
                  </p>

                  {/* SUBTOTAL */}
                  <div className="fc-summary-row">
                    <span>
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"})
                    </span>

                    <strong>R{subtotal.toFixed(2)}</strong>
                  </div>

                  {/* LINE ITEMS */}
                  <div className="fc-summary-row">
                    <span>Total Line Items</span>

                    <strong>{cart.length}</strong>
                  </div>

                  {/* DELIVERY */}
                  <div className="fc-summary-row">
                    <span>
                      Delivery
                      {subtotal >= 200 && (
                        <small className="fc-free-delivery">
                          Free delivery applied
                        </small>
                      )}
                    </span>

                    <strong>R{deliveryFee.toFixed(2)}</strong>
                  </div>

                  <hr className="fc-summary-divider" />

                  {/* TOTAL */}
                  <div className="fc-summary-total">
                    <span>Order Total</span>

                    <strong>R{totalPrice.toFixed(2)}</strong>
                  </div>

                  {/* CHECKOUT */}
                  <button
                    type="button"
                    className="fc-cart-checkout-btn"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>

                  {/* CONTINUE SHOPPING */}
                  <Link to="/shop" className="fc-cart-continue-btn">
                    Continue Shopping
                  </Link>

                  <div className="fc-cart-security">
                    <span>🔒</span>
                    <span>Secure checkout and payment processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
