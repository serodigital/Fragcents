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

  // Item total
  const getItemTotal = (item) => {
    return parsePrice(item.price) * (item.quantity || 1);
  };

  // Subtotal
  const subtotal = cart.reduce((total, item) => total + getItemTotal(item), 0);

  // Delivery
  const deliveryFee = subtotal >= 200 ? 0 : subtotal > 0 ? 50 : 0;

  // Final total
  const totalPrice = subtotal + deliveryFee;

  // Total number of products
  const totalItems = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  // Product image
  const getImageUrl = (item) => {
    if (item._id) {
      return `${API_URL}/api/product/image/${item._id}`;
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
      <div className="frag-checkout">
        <style>{`
          .frag-checkout {
            --fc-navy: #957a4a;
            --fc-cream: #f7f5f0;
            --fc-gold: #b69b78;
            --fc-muted: #777f89;
            background: var(--fc-cream);
            min-height: 75vh;
            padding: 75px 20px;
            color: var(--fc-navy);
          }

          .frag-checkout * {
            box-sizing: border-box;
          }

          .fc-empty {
            max-width: 560px;
            margin: 0 auto;
            padding: 55px 30px;
            background: #fff;
            border: 1px solid #e9e5de;
            border-radius: 12px;
            text-align: center;
          }

          .fc-empty-icon {
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

          .fc-empty h3 {
            font-size: 25px;
            font-weight: 700;
            margin-bottom: 10px;
          }

          .fc-empty p {
            color: var(--fc-muted);
            margin-bottom: 25px;
          }

          .fc-primary-btn {
            background: var(--fc-navy);
            color: white;
            border: 1px solid var(--fc-navy);
            padding: 14px 24px;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 600;
            transition: .2s ease;
          }

          .fc-primary-btn:hover {
            background: #243f5e;
            color: white;
          }

          .fc-page {
            max-width: 1180px;
            margin: 0 auto;
          }

          .fc-header {
            margin-bottom: 35px;
          }

          .fc-eyebrow {
            color: var(--fc-gold);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 9px;
          }

          .fc-header h2 {
            color: var(--fc-navy);
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 10px;
          }

          .fc-header p {
            color: var(--fc-muted);
            font-size: 14px;
            margin: 0;
          }

          .fc-steps {
            display: flex;
            align-items: center;
            max-width: 490px;
            margin-top: 27px;
            gap: 12px;
          }

          .fc-step {
            display: flex;
            align-items: center;
            gap: 9px;
            color: #a0a5aa;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
          }

          .fc-step-number {
            width: 27px;
            height: 27px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e8e5df;
            color: #858b92;
            font-size: 12px;
          }

          .fc-step.active {
            color: var(--fc-navy);
          }

          .fc-step.active .fc-step-number {
            background: var(--fc-navy);
            color: white;
          }

          .fc-step-line {
            flex: 1;
            height: 1px;
            background: #dedbd4;
            min-width: 25px;
          }

          .fc-layout {
            display: grid;
            grid-template-columns: minmax(0, 1.7fr) minmax(300px, .85fr);
            gap: 28px;
            align-items: start;
          }

          .fc-card {
            background: white;
            border: 1px solid #e9e5de;
            border-radius: 9px;
            overflow: hidden;
          }

          .fc-card-header {
            padding: 23px 25px;
            border-bottom: 1px solid #eeeae4;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .fc-card-header h5 {
            color: var(--fc-navy);
            font-size: 17px;
            font-weight: 700;
            margin: 0;
          }

          .fc-count {
            color: var(--fc-muted);
            font-size: 12px;
          }

          .fc-items {
            padding: 0 25px;
          }

          .fc-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            padding: 21px 0;
            border-bottom: 1px solid #eeeae4;
          }

          .fc-item:last-child {
            border-bottom: none;
          }

          .fc-product {
            display: flex;
            align-items: center;
            gap: 17px;
            min-width: 0;
          }

          .fc-product-image {
            width: 88px;
            height: 88px;
            flex-shrink: 0;
            object-fit: cover;
            border-radius: 6px;
            background: #f5f3ef;
            border: 1px solid #eeeae4;
          }

          .fc-product-name {
            color: var(--fc-navy);
            font-size: 14px;
            font-weight: 650;
            margin: 0 0 8px;
            line-height: 1.5;
          }

          .fc-product-price {
            color: var(--fc-muted);
            font-size: 13px;
            margin: 0;
          }

          .fc-item-total {
            color: var(--fc-navy);
            font-size: 14px;
            font-weight: 700;
            white-space: nowrap;
          }

          .fc-summary {
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
            margin-bottom: 20px;
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

          .fc-divider {
            border: 0;
            border-top: 1px solid #eae6df;
            margin: 22px 0;
          }

          .fc-total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
          }

          .fc-total-row span {
            color: var(--fc-navy);
            font-size: 15px;
            font-weight: 700;
          }

          .fc-total-row strong {
            color: var(--fc-navy);
            font-size: 23px;
            font-weight: 750;
            white-space: nowrap;
          }

          .fc-checkout-btn {
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

          .fc-checkout-btn:hover {
            background: #243f5e;
            border-color: #243f5e;
          }

          .fc-back-btn {
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
            transition: .2s ease;
          }

          .fc-back-btn:hover {
            background: #f7f5f0;
          }

          .fc-security-note {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            color: var(--fc-muted);
            font-size: 11px;
            margin-top: 20px;
            text-align: center;
          }

          .fc-delivery-note {
            margin-top: 18px;
            padding: 13px 14px;
            background: #f7f5f0;
            border-radius: 5px;
            color: #606975;
            font-size: 11px;
            line-height: 1.6;
          }

          .fc-delivery-note strong {
            color: var(--fc-navy);
          }

          @media (max-width: 767px) {
            .frag-checkout {
              padding: 40px 15px;
            }

            .fc-header h2 {
              font-size: 27px;
            }

            .fc-layout {
              grid-template-columns: 1fr;
              gap: 20px;
            }

            .fc-summary {
              position: static;
            }

            .fc-card-header {
              padding: 19px;
            }

            .fc-items {
              padding: 0 19px;
            }

            .fc-product-image {
              width: 70px;
              height: 70px;
            }

            .fc-product {
              gap: 12px;
            }

            .fc-item {
              gap: 10px;
            }

            .fc-item-total {
              font-size: 13px;
            }

            .fc-steps {
              gap: 7px;
            }

            .fc-step {
              gap: 5px;
              font-size: 10px;
            }

            .fc-step-number {
              width: 24px;
              height: 24px;
            }
          }

          @media (max-width: 380px) {
            .fc-step {
              font-size: 9px;
            }

            .fc-product-image {
              width: 58px;
              height: 58px;
            }

            .fc-product-name {
              font-size: 12px;
            }
          }
        `}</style>

        <div className="fc-empty">
          <div className="fc-empty-icon">🛍</div>
          <h3>Your cart is empty</h3>
          <p>
            You haven't added any products to your cart yet. Explore our
            collection and find something you love.
          </p>
          <button className="fc-primary-btn" onClick={() => navigate("/shop")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="frag-checkout">
      <style>{`
        .frag-checkout {
          --fc-navy: #172d46;
          --fc-cream: #f7f5f0;
          --fc-gold: #b69b78;
          --fc-muted: #777f89;
          background: var(--fc-cream);
          min-height: 75vh;
          padding: 55px 20px 70px;
          color: var(--fc-navy);
        }

        .frag-checkout * {
          box-sizing: border-box;
        }

        .fc-page {
          max-width: 1180px;
          margin: 0 auto;
        }

        .fc-header {
          margin-bottom: 35px;
        }

        .fc-eyebrow {
          color: var(--fc-gold);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 9px;
        }

        .fc-header h2 {
          color: var(--fc-navy);
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px;
        }

        .fc-header p {
          color: var(--fc-muted);
          font-size: 14px;
          margin: 0;
        }

        .fc-steps {
          display: flex;
          align-items: center;
          max-width: 490px;
          margin-top: 27px;
          gap: 12px;
        }

        .fc-step {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #a0a5aa;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .fc-step-number {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8e5df;
          color: #858b92;
          font-size: 12px;
        }

        .fc-step.active {
          color: var(--fc-navy);
        }

        .fc-step.active .fc-step-number {
          background: var(--fc-navy);
          color: white;
        }

        .fc-step-line {
          flex: 1;
          height: 1px;
          background: #dedbd4;
          min-width: 25px;
        }

        .fc-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(300px, .85fr);
          gap: 28px;
          align-items: start;
        }

        .fc-card {
          background: white;
          border: 1px solid #e9e5de;
          border-radius: 9px;
          overflow: hidden;
        }

        .fc-card-header {
          padding: 23px 25px;
          border-bottom: 1px solid #eeeae4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .fc-card-header h5 {
          color: var(--fc-navy);
          font-size: 17px;
          font-weight: 700;
          margin: 0;
        }

        .fc-count {
          color: var(--fc-muted);
          font-size: 12px;
        }

        .fc-items {
          padding: 0 25px;
        }

        .fc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 21px 0;
          border-bottom: 1px solid #eeeae4;
        }

        .fc-item:last-child {
          border-bottom: none;
        }

        .fc-product {
          display: flex;
          align-items: center;
          gap: 17px;
          min-width: 0;
        }

        .fc-product-image {
          width: 88px;
          height: 88px;
          flex-shrink: 0;
          object-fit: cover;
          border-radius: 6px;
          background: #f5f3ef;
          border: 1px solid #eeeae4;
        }

        .fc-product-name {
          color: var(--fc-navy);
          font-size: 14px;
          font-weight: 650;
          margin: 0 0 8px;
          line-height: 1.5;
        }

        .fc-product-price {
          color: var(--fc-muted);
          font-size: 13px;
          margin: 0;
        }

        .fc-item-total {
          color: var(--fc-navy);
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        .fc-summary {
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
          margin-bottom: 20px;
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

        .fc-divider {
          border: 0;
          border-top: 1px solid #eae6df;
          margin: 22px 0;
        }

        .fc-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .fc-total-row span {
          color: var(--fc-navy);
          font-size: 15px;
          font-weight: 700;
        }

        .fc-total-row strong {
          color: var(--fc-navy);
          font-size: 23px;
          font-weight: 750;
          white-space: nowrap;
        }

        .fc-checkout-btn {
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

        .fc-checkout-btn:hover {
          background: #243f5e;
          border-color: #243f5e;
        }

        .fc-back-btn {
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
          transition: .2s ease;
        }

        .fc-back-btn:hover {
          background: #f7f5f0;
        }

        .fc-security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: var(--fc-muted);
          font-size: 11px;
          margin-top: 20px;
          text-align: center;
        }

        .fc-delivery-note {
          margin-top: 18px;
          padding: 13px 14px;
          background: #f7f5f0;
          border-radius: 5px;
          color: #606975;
          font-size: 11px;
          line-height: 1.6;
        }

        .fc-delivery-note strong {
          color: var(--fc-navy);
        }

        @media (max-width: 767px) {
          .frag-checkout {
            padding: 40px 15px;
          }

          .fc-header h2 {
            font-size: 27px;
          }

          .fc-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .fc-summary {
            position: static;
          }

          .fc-card-header {
            padding: 19px;
          }

          .fc-items {
            padding: 0 19px;
          }

          .fc-product-image {
            width: 70px;
            height: 70px;
          }

          .fc-product {
            gap: 12px;
          }

          .fc-item {
            gap: 10px;
          }

          .fc-item-total {
            font-size: 13px;
          }

          .fc-steps {
            gap: 7px;
          }

          .fc-step {
            gap: 5px;
            font-size: 10px;
          }

          .fc-step-number {
            width: 24px;
            height: 24px;
          }
        }

        @media (max-width: 380px) {
          .fc-step {
            font-size: 9px;
          }

          .fc-product-image {
            width: 58px;
            height: 58px;
          }

          .fc-product-name {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="fc-page">
        {/* PAGE HEADER */}
        <div className="fc-header">
          <div className="fc-eyebrow">FragCents Shopping</div>

          <h2>Checkout</h2>

          <p>Review your order before proceeding to secure payment.</p>

          {/* CHECKOUT PROGRESS */}
          <div className="fc-steps">
            <div className="fc-step active">
              <span className="fc-step-number">1</span>
              <span>Cart</span>
            </div>

            <div className="fc-step-line"></div>

            <div className="fc-step">
              <span className="fc-step-number">2</span>
              <span>Delivery</span>
            </div>

            <div className="fc-step-line"></div>

            <div className="fc-step">
              <span className="fc-step-number">3</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="fc-layout">
          {/* LEFT: ORDER ITEMS */}
          <div>
            <div className="fc-card">
              <div className="fc-card-header">
                <h5>Your Order</h5>

                <span className="fc-count">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="fc-items">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="fc-item">
                    <div className="fc-product">
                      <img
                        src={getImageUrl(item)}
                        alt={item.name}
                        className="fc-product-image"
                        onError={(e) => {
                          e.target.src = "/images/default.jpg";
                        }}
                      />

                      <div>
                        <h6 className="fc-product-name">{item.name}</h6>

                        <p className="fc-product-price">
                          R{parsePrice(item.price).toFixed(2)} ×{" "}
                          {item.quantity || 1}
                        </p>
                      </div>
                    </div>

                    <strong className="fc-item-total">
                      R{getItemTotal(item).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* DELIVERY INFORMATION */}
            <div className="fc-delivery-note">
              <strong>Delivery information</strong>
              <br />
              Your delivery fee is calculated automatically based on your order
              subtotal. Orders of R200 or more qualify for free delivery.
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="fc-summary">
            <div className="fc-card">
              <div className="fc-summary-body">
                <h4 className="fc-summary-title">Order Summary</h4>

                <p className="fc-summary-subtitle">
                  A breakdown of your purchase
                </p>

                {/* SUBTOTAL */}
                <div className="fc-summary-row">
                  <span>
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}
                    )
                  </span>

                  <strong>R{subtotal.toFixed(2)}</strong>
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

                <hr className="fc-divider" />

                {/* TOTAL */}
                <div className="fc-total-row">
                  <span>Order Total</span>

                  <strong>R{totalPrice.toFixed(2)}</strong>
                </div>

                {/* SECURE CHECKOUT */}
                <button
                  className="fc-checkout-btn"
                  onClick={handleSecureCheckout}
                >
                  Proceed to Secure Checkout
                </button>

                {/* BACK TO CART */}
                <button
                  className="fc-back-btn"
                  onClick={() => navigate("/cart")}
                >
                  Back to Cart
                </button>

                <div className="fc-security-note">
                  <span>🔒</span>
                  <span>Secure checkout and payment processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
