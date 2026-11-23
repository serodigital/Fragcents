
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/Auth";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "";

const SecureCheckout = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { auth } = useAuth();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // CUSTOMER INFORMATION
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // DELIVERY INFORMATION
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("South Africa");

  // LOAD LOGGED-IN USER
  useEffect(() => {
    const loadUser = async () => {
      // GUEST CHECKOUT
      if (!auth?.token || !auth?.user) {
        console.log("=================================");
        console.log("GUEST CHECKOUT");
        console.log("No logged-in user found.");
        console.log("=================================");

        setUser(null);
        setLoadingUser(false);
        return;
      }

      setLoadingUser(true);

      console.log("=================================");
      console.log("AUTH USER FROM LOCAL STORAGE");
      console.log(auth.user);
      console.log("=================================");

      setUser(auth.user);
      setName(auth.user.name || "");
      setEmail(auth.user.email || "");
      setPhone(auth.user.phone || "");

      // CHECK USER ID
      const userId = auth.user?._id || auth.user?.id;

      if (!userId) {
        console.log("User ID missing from auth.user.");
        setLoadingUser(false);
        return;
      }

      try {
        // GET USER FROM DATABASE
        const response = await axios.get(
          `${API_URL}/api/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        console.log("=================================");
        console.log("FULL USER PROFILE FROM DATABASE");
        console.log(response.data);
        console.log("=================================");

        const databaseUser = response.data?.user;

        if (!databaseUser) {
          console.log("No user profile returned from database.");
          setLoadingUser(false);
          return;
        }

        setUser(databaseUser);

        // CUSTOMER INFORMATION
        setName(databaseUser.name || auth.user.name || "");
        setEmail(databaseUser.email || auth.user.email || "");
        setPhone(databaseUser.phone || "");

        // DELIVERY ADDRESS
        if (typeof databaseUser.address === "string") {
          setAddress(databaseUser.address);
          setCity("");
          setProvince("");
          setPostalCode("");
          setCountry("South Africa");
        } else {
          const savedAddress = databaseUser.address || {};

          setAddress(savedAddress.street || "");
          setCity(savedAddress.city || "");
          setProvince(savedAddress.province || "");
          setPostalCode(savedAddress.postalCode || "");
          setCountry(savedAddress.country || "South Africa");
        }

        // DEBUG
        console.log("=================================");
        console.log("CHECKOUT DETAILS LOADED");
        console.log("=================================");
        console.log("User ID:", databaseUser._id);
        console.log("Name:", databaseUser.name);
        console.log("Email:", databaseUser.email);
        console.log("Phone:", databaseUser.phone);
        console.log("Address:", databaseUser.address);
        console.log("=================================");
      } catch (error) {
        console.error("ERROR LOADING USER PROFILE:", error);

        // FALLBACK
        setName(auth.user.name || "");
        setEmail(auth.user.email || "");
        setPhone(auth.user.phone || "");
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [auth?.token, auth?.user?._id, auth?.user?.id]);

  // PRICE PARSER
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

  // ITEM TOTAL
  const getItemTotal = (item) => {
    return parsePrice(item.price) * (item.quantity || 1);
  };

  // SUBTOTAL
  const subtotal = cart.reduce((total, item) => {
    return total + getItemTotal(item);
  }, 0);

  // DELIVERY
  const deliveryFee =
    subtotal >= 200 ? 0 : subtotal > 0 ? 50 : 0;

  // TOTAL
  const totalPrice = subtotal + deliveryFee;

  // PAY NOW
  const handlePayment = async () => {
    // CHECK CART
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty.");
      navigate("/cart");
      return;
    }

    // CUSTOMER VALIDATION
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    // ADDRESS VALIDATION
    if (!address.trim()) {
      toast.error("Please enter your street address.");
      return;
    }

    if (!city.trim()) {
      toast.error("Please enter your city.");
      return;
    }

    if (!province.trim()) {
      toast.error("Please enter your province.");
      return;
    }

    if (!postalCode.trim()) {
      toast.error("Please enter your postal code.");
      return;
    }

    if (!country.trim()) {
      toast.error("Please enter your country.");
      return;
    }

    try {
      // PRODUCTS
      const products = cart.map((item) => {
        const productId = item.product || item._id;

        if (!productId) {
          throw new Error(
            `Product ID missing for ${item.name || "product"}`
          );
        }

        return {
          product: productId,
          name: item.name,
          quantity: item.quantity || 1,
          price: parsePrice(item.price),
        };
      });

      // CUSTOMER
      const customer = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      // DELIVERY ADDRESS
      const deliveryAddress = {
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      };

      // ORDER DATA
      const orderData = {
        user: user?._id || null,
        customer,
        deliveryAddress,
        products,
        subtotal: Number(subtotal.toFixed(2)),
        deliveryFee: Number(deliveryFee.toFixed(2)),
        totalAmount: Number(totalPrice.toFixed(2)),
        paymentStatus: "pending",
        orderStatus: "pending",
      };

      // DEBUG
      console.log("=================================");
      console.log("SECURE CHECKOUT ORDER");
      console.log("=================================");
      console.log(JSON.stringify(orderData, null, 2));
      console.log("=================================");

      // SAVE PENDING ORDER LOCALLY
      localStorage.setItem("pendingOrder", JSON.stringify(orderData));
      console.log("Pending order saved.");

      // CREATE PAYFAST PAYMENT
      console.log("=================================");
      console.log("STARTING PAYFAST PAYMENT");
      console.log("=================================");

      const paymentResponse = await axios.post(
        `${API_URL}/api/payfast/create`,
        {
          ...orderData,
          amount: Number(totalPrice.toFixed(2)),
          itemName: "FragCents Order",
          itemDescription: "Payment for FragCents order",
        }
      );

      console.log("PayFast response:", paymentResponse.data);

      // CHECK PAYFAST RESPONSE
      if (!paymentResponse.data?.success) {
        throw new Error(
          paymentResponse.data?.message ||
            "Unable to initialize PayFast payment."
        );
      }

      // GET PAYFAST DATA
      const payfastData = paymentResponse.data;

      const paymentUrl =
        payfastData.paymentUrl ||
        "https://payment.payfast.io/eng/process";

      const formData = payfastData.formData;

      if (!formData || typeof formData !== "object") {
        throw new Error(
          "PayFast payment form data was not returned."
        );
      }

      // SAVE PAYFAST REFERENCE
      if (payfastData.paymentReference) {
        const updatedOrder = {
          ...orderData,
          paymentReference: payfastData.paymentReference,
        };

        localStorage.setItem(
          "pendingOrder",
          JSON.stringify(updatedOrder)
        );

        localStorage.setItem(
          "payfastReference",
          payfastData.paymentReference
        );
      }

      // CREATE PAYFAST FORM
      const form = document.createElement("form");

      form.method = "POST";
      form.action = paymentUrl;
      form.style.display = "none";

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement("input");

        input.type = "hidden";
        input.name = key;
        input.value = value ?? "";

        form.appendChild(input);
      });

      document.body.appendChild(form);

      console.log("Redirecting to PayFast...");
      form.submit();
    } catch (error) {
      console.error("=================================");
      console.error("PAYFAST PAYMENT ERROR");
      console.error("=================================");
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error("Message:", error.message);
      console.error("=================================");

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to start PayFast payment."
      );
    }
  };

  // UI - DESIGN ONLY
  return (
    <div className="frag-checkout">
      <style>{`
        .frag-checkout {
          --fc-navy: #957a4a;
          --fc-navy-light: #263445;
          --fc-cream: #f7f5f0;
          --fc-gold: #263445;
          --fc-text: #000307;
          --fc-muted: #000000;
          --fc-border: #e8e7e2;
          background: var(--fc-cream);
          min-height: 100vh;
          padding: 55px 0 75px;
          color: var(--fc-text);
        }

        .frag-checkout * {
          box-sizing: border-box;
        }

        .frag-checkout .fc-container {
          width: 100%;
          max-width: 1160px;
          padding: 0 20px;
          margin: 0 auto;
        }

        .frag-checkout .fc-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .frag-checkout .fc-eyebrow {
          color: var(--fc-gold);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .frag-checkout .fc-title {
          color: var(--fc-navy);
          font-size: clamp(29px, 4vw, 39px);
          font-weight: 700;
          letter-spacing: -1.2px;
          margin: 0 0 10px;
        }

        .frag-checkout .fc-subtitle {
          color: var(--fc-muted);
          font-size: 14px;
          margin: 0;
        }

        .frag-checkout .fc-steps {
          display: flex;
          justify-content: center;
          align-items: center;
          max-width: 490px;
          margin: 0 auto 38px;
        }

        .frag-checkout .fc-step {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #00050a;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .frag-checkout .fc-step-number {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 29px;
          height: 29px;
          border: 1px solid #d9d9d4;
          border-radius: 50%;
          background: #fff;
          font-size: 12px;
        }

        .frag-checkout .fc-step.active {
          color: var(--fc-navy);
        }

        .frag-checkout .fc-step.active .fc-step-number {
          background: var(--fc-navy);
          color: #fff;
          border-color: var(--fc-navy);
        }

        .frag-checkout .fc-step-line {
          width: 65px;
          height: 1px;
          background: #dcdad4;
          margin: 0 13px;
        }

        .frag-checkout .fc-status {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 17px 19px;
          margin-bottom: 23px;
          border: 1px solid var(--fc-border);
          border-radius: 12px;
          background: #fff;
        }

        .frag-checkout .fc-status-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f0f2f4;
          color: var(--fc-navy);
          font-size: 16px;
        }

        .frag-checkout .fc-status strong {
          display: block;
          color: var(--fc-navy);
          font-size: 13px;
          margin-bottom: 4px;
        }

        .frag-checkout .fc-status p {
          color: var(--fc-muted);
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }

        .frag-checkout .fc-status.success .fc-status-icon {
          background: #edf5ef;
          color: #38734b;
        }

        .frag-checkout .fc-status.info .fc-status-icon {
          background: #edf2f7;
          color: var(--fc-navy);
        }

        .frag-checkout .fc-card {
          background: #fff;
          border: 1px solid var(--fc-border);
          border-radius: 15px;
          margin-bottom: 22px;
          overflow: hidden;
          box-shadow: 0 5px 22px rgba(30, 43, 57, 0.035);
        }

        .frag-checkout .fc-card-header {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 22px 25px;
          border-bottom: 1px solid #efeee9;
        }

        .frag-checkout .fc-card-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #f2f0eb;
          color: var(--fc-navy);
          font-size: 17px;
        }

        .frag-checkout .fc-card-heading {
          color: var(--fc-navy);
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px;
        }

        .frag-checkout .fc-card-description {
          color: var(--fc-muted);
          font-size: 11px;
          margin: 0;
        }

        .frag-checkout .fc-card-body {
          padding: 24px 25px;
        }

        .frag-checkout .fc-form-group {
          margin-bottom: 19px;
        }

        .frag-checkout .fc-form-group:last-child {
          margin-bottom: 0;
        }

        .frag-checkout .fc-label {
          display: block;
          color: #3b4858;
          font-size: 12px;
          font-weight: 650;
          margin-bottom: 8px;
        }

        .frag-checkout .fc-input {
          display: block;
          width: 100%;
          min-height: 47px;
          padding: 11px 14px;
          color: var(--fc-text);
          background: #fff;
          border: 1px solid #dedfdc;
          border-radius: 8px;
          outline: none;
          font-family: inherit;
          font-size: 13px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .frag-checkout .fc-input:focus {
          border-color: var(--fc-navy-light);
          box-shadow: 0 0 0 3px rgba(23, 45, 70, 0.08);
        }

        .frag-checkout .fc-input::placeholder {
          color: #a6abb2;
        }

        .frag-checkout .fc-input[readonly] {
          background: #f7f7f5;
          color: #737c87;
          cursor: default;
        }

        .frag-checkout .fc-input[readonly]:focus {
          border-color: #dedfdc;
          box-shadow: none;
        }

        .frag-checkout .fc-address-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          margin-bottom: 23px;
          background: #f3f6f9;
          border: 1px solid #dfe7ef;
          border-radius: 9px;
        }

        .frag-checkout .fc-address-notice-icon {
          color: var(--fc-navy);
          font-size: 17px;
          flex-shrink: 0;
        }

        .frag-checkout .fc-address-notice-content strong {
          display: block;
          color: var(--fc-navy);
          font-size: 12px;
          margin-bottom: 5px;
        }

        .frag-checkout .fc-address-notice-content p {
          color: var(--fc-muted);
          font-size: 11px;
          line-height: 1.6;
          margin: 0;
        }

        .frag-checkout .fc-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .frag-checkout .fc-section-heading .fc-card-heading {
          margin: 0;
        }

        .frag-checkout .fc-edit-btn {
          border: 1px solid #dce1e6;
          background: #fff;
          color: var(--fc-navy);
          border-radius: 7px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .frag-checkout .fc-edit-btn:hover {
          background: var(--fc-navy);
          border-color: var(--fc-navy);
          color: #fff;
        }

        .frag-checkout .fc-summary {
          position: sticky;
          top: 25px;
        }

        .frag-checkout .fc-summary .fc-card-header {
          background: var(--fc-navy);
          border-bottom: none;
        }

        .frag-checkout .fc-summary .fc-card-icon {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
        }

        .frag-checkout .fc-summary .fc-card-heading {
          color: #fff;
        }

        .frag-checkout .fc-summary .fc-card-description {
          color: #d1d9e1;
        }

        .frag-checkout .fc-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #efeee9;
        }

        .frag-checkout .fc-item:first-child {
          padding-top: 0;
        }

        .frag-checkout .fc-item-name {
          color: var(--fc-text);
          font-size: 13px;
          font-weight: 650;
          margin-bottom: 5px;
          overflow-wrap: anywhere;
        }

        .frag-checkout .fc-item-quantity {
          color: var(--fc-muted);
          font-size: 11px;
        }

        .frag-checkout .fc-item-price {
          color: var(--fc-navy);
          font-size: 13px;
          font-weight: 650;
          white-space: nowrap;
        }

        .frag-checkout .fc-summary-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 14px;
          color: #697482;
          font-size: 13px;
        }

        .frag-checkout .fc-summary-row strong {
          color: var(--fc-text);
          font-weight: 650;
        }

        .frag-checkout .fc-free {
          color: #39734b !important;
          font-weight: 700;
        }

        .frag-checkout .fc-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 18px;
          margin-top: 17px;
          border-top: 1px solid #e8e7e2;
        }

        .frag-checkout .fc-total-label {
          color: var(--fc-navy);
          font-size: 14px;
          font-weight: 700;
        }

        .frag-checkout .fc-total-amount {
          color: var(--fc-navy);
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -0.7px;
        }

        .frag-checkout .fc-delivery-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px;
          margin-top: 20px;
          border-radius: 9px;
          background: #f4f5f2;
          color: #536052;
          font-size: 11px;
          line-height: 1.6;
        }

        .frag-checkout .fc-delivery-note i {
          color: #64816a;
          font-size: 15px;
        }

        .frag-checkout .fc-pay-btn {
          width: 100%;
          min-height: 51px;
          margin-top: 23px;
          border: none;
          border-radius: 8px;
          background: var(--fc-navy);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          transition: background 0.2s, transform 0.2s;
        }

        .frag-checkout .fc-pay-btn:hover:not(:disabled) {
          background: var(--fc-navy-light);
          transform: translateY(-1px);
        }

        .frag-checkout .fc-pay-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .frag-checkout .fc-back-btn {
          width: 100%;
          min-height: 45px;
          margin-top: 10px;
          border: 1px solid #dfe1e3;
          border-radius: 8px;
          background: #fff;
          color: #596574;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .frag-checkout .fc-back-btn:hover {
          background: #f5f5f3;
          border-color: #c8cdd2;
        }

        .frag-checkout .fc-payment-trust {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          color: #7b8490;
          font-size: 10px;
        }

        .frag-checkout .fc-payment-trust i {
          color: #64816a;
          font-size: 14px;
        }

        .frag-checkout .fc-email-note {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          margin-bottom: 22px;
          background: #fff;
          border: 1px solid var(--fc-border);
          border-radius: 9px;
          color: #6c7784;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .frag-checkout .fc-email-note i {
          color: var(--fc-gold);
          font-size: 16px;
        }

        .frag-checkout .fc-email-note strong {
          color: var(--fc-navy);
        }

        .frag-checkout .fc-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 17px;
          margin-bottom: 22px;
          background: #fff;
          border: 1px solid var(--fc-border);
          border-radius: 9px;
          color: var(--fc-muted);
          font-size: 12px;
        }

        @media (max-width: 767px) {
          .frag-checkout {
            padding: 35px 0 50px;
          }

          .frag-checkout .fc-container {
            padding: 0 15px;
          }

          .frag-checkout .fc-header {
            margin-bottom: 28px;
          }

          .frag-checkout .fc-steps {
            margin-bottom: 27px;
          }

          .frag-checkout .fc-step {
            gap: 6px;
            font-size: 10px;
          }

          .frag-checkout .fc-step-number {
            width: 26px;
            height: 26px;
          }

          .frag-checkout .fc-step-line {
            width: 25px;
            margin: 0 7px;
          }

          .frag-checkout .fc-card-header {
            padding: 18px;
          }

          .frag-checkout .fc-card-body {
            padding: 19px;
          }

          .frag-checkout .fc-summary {
            position: static;
          }

          .frag-checkout .fc-total-amount {
            font-size: 23px;
          }
        }
      `}</style>

      <div className="fc-container">

        {/* PAGE HEADING */}
        <div className="fc-header">
          <div className="fc-eyebrow">FRAGCENTS · CHECKOUT</div>
          <h2 className="fc-title">Complete Your Order</h2>
          <p className="fc-subtitle">
            Just a few more details before your order is complete.
          </p>
        </div>

        {/* CHECKOUT PROGRESS */}
        <div className="fc-steps">
          <div className="fc-step">
            <span className="fc-step-number">
              <i className="bi bi-check-lg"></i>
            </span>
            <span>Cart</span>
          </div>

          <div className="fc-step-line"></div>

          <div className="fc-step active">
            <span className="fc-step-number">2</span>
            <span>Delivery</span>
          </div>

          <div className="fc-step-line"></div>

          <div className="fc-step">
            <span className="fc-step-number">3</span>
            <span>Payment</span>
          </div>
        </div>

        {/* LOADING */}
        {loadingUser && (
          <div className="fc-loading">
            <i className="bi bi-arrow-repeat"></i>
            Loading your saved customer information...
          </div>
        )}

        {/* GUEST */}
        {!user && !loadingUser && (
          <div className="fc-status info">
            <div className="fc-status-icon">
              <i className="bi bi-person"></i>
            </div>
            <div>
              <strong>Guest Checkout</strong>
              <p>
                You can continue without creating an account.
                Enter your details below to proceed.
              </p>
            </div>
          </div>
        )}

        {/* LOGGED IN */}
        {user && !loadingUser && (
          <div className="fc-status success">
            <div className="fc-status-icon">
              <i className="bi bi-check2-circle"></i>
            </div>
            <div>
              <strong>Welcome back, {user.name}</strong>
              <p>
                Your saved customer information has been loaded
                from your account.
              </p>
            </div>
          </div>
        )}

        {/* ORDER CONFIRMATION EMAIL */}
        {email && (
          <div className="fc-email-note">
            <i className="bi bi-envelope-check"></i>
            <span>
              Order confirmation will be sent to:{" "}
              <strong>{email}</strong>
            </span>
          </div>
        )}

        <div className="row">

          {/* LEFT SIDE */}
          <div className="col-lg-7">

            {/* CUSTOMER INFORMATION */}
            <div className="fc-card">
              <div className="fc-card-header">
                <div className="fc-card-icon">
                  <i className="bi bi-person"></i>
                </div>
                <div>
                  <h5 className="fc-card-heading">
                    Customer Information
                  </h5>
                  <p className="fc-card-description">
                    Your contact details for this order
                  </p>
                </div>
              </div>

              <div className="fc-card-body">

                {/* NAME */}
                <div className="fc-form-group">
                  <label className="fc-label">Full Name</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={name}
                    readOnly={!!user}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* EMAIL */}
                <div className="fc-form-group">
                  <label className="fc-label">Email Address</label>
                  <input
                    type="email"
                    className="fc-input"
                    value={email}
                    readOnly={!!user}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>

                {/* PHONE */}
                <div className="fc-form-group">
                  <label className="fc-label">Phone Number</label>
                  <input
                    type="tel"
                    className="fc-input"
                    value={phone}
                    readOnly={!!user}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

              </div>
            </div>

            {/* DELIVERY INFORMATION */}
            <div className="fc-card">
              <div className="fc-card-header">
                <div className="fc-card-icon">
                  <i className="bi bi-truck"></i>
                </div>

                <div style={{ flex: 1 }}>
                  <h5 className="fc-card-heading">
                    Delivery Information
                  </h5>
                  <p className="fc-card-description">
                    Where should we deliver your order?
                  </p>
                </div>

                {user && (
                  <button
                    type="button"
                    className="fc-edit-btn"
                    onClick={() => navigate("/dashboard")}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Edit Address
                  </button>
                )}
              </div>

              <div className="fc-card-body">

                {user && (
                  <div className="fc-address-notice">
                    <div className="fc-address-notice-icon">
                      <i className="bi bi-info-circle"></i>
                    </div>

                    <div className="fc-address-notice-content">
                      <strong>Need to change your delivery address?</strong>
                      <p>
                        Your saved address cannot be edited directly during
                        checkout. Please use the Edit Address button above
                        to update it from your account dashboard.
                      </p>
                    </div>
                  </div>
                )}

                {/* STREET */}
                <div className="fc-form-group">
                  <label className="fc-label">Street Address</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={address}
                    readOnly={!!user}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>

                {/* CITY */}
                <div className="fc-form-group">
                  <label className="fc-label">City</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={city}
                    readOnly={!!user}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                  />
                </div>

                {/* PROVINCE */}
                <div className="fc-form-group">
                  <label className="fc-label">Province</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={province}
                    readOnly={!!user}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Enter province"
                  />
                </div>

                {/* POSTAL CODE */}
                <div className="fc-form-group">
                  <label className="fc-label">Postal Code</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={postalCode}
                    readOnly={!!user}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>

                {/* COUNTRY */}
                <div className="fc-form-group">
                  <label className="fc-label">Country</label>
                  <input
                    type="text"
                    className="fc-input"
                    value={country}
                    readOnly={!!user}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE - ORDER SUMMARY */}
          <div className="col-lg-5">
            <div className="fc-card fc-summary">

              <div className="fc-card-header">
                <div className="fc-card-icon">
                  <i className="bi bi-bag-check"></i>
                </div>
                <div>
                  <h5 className="fc-card-heading">
                    Order Summary
                  </h5>
                  <p className="fc-card-description">
                    Review your items before payment
                  </p>
                </div>
              </div>

              <div className="fc-card-body">

                {/* CART ITEMS */}
                <div>
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId || item._id}
                      className="fc-item"
                    >
                      <div>
                        <div className="fc-item-name">
                          {item.name}
                        </div>
                        <div className="fc-item-quantity">
                          Quantity: {item.quantity || 1}
                        </div>
                      </div>

                      <span className="fc-item-price">
                        R{getItemTotal(item).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* PRICE BREAKDOWN */}
                <div style={{ paddingTop: "20px" }}>

                  <div className="fc-summary-row">
                    <span>Subtotal</span>
                    <strong>R{subtotal.toFixed(2)}</strong>
                  </div>

                  <div className="fc-summary-row">
                    <span>Delivery</span>
                    <strong className={deliveryFee === 0 ? "fc-free" : ""}>
                      {deliveryFee === 0
                        ? "FREE"
                        : `R${deliveryFee.toFixed(2)}`}
                    </strong>
                  </div>

                </div>

                {/* TOTAL */}
                <div className="fc-total">
                  <span className="fc-total-label">Total Amount</span>
                  <span className="fc-total-amount">
                    R{totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* DELIVERY NOTE */}
                <div className="fc-delivery-note">
                  <i className="bi bi-truck"></i>
                  <span>
                    {deliveryFee === 0
                      ? "Great news! Your order qualifies for free delivery."
                      : "Free delivery on orders of R200 or more."}
                  </span>
                </div>

                {/* PAY NOW */}
                <button
                  className="fc-pay-btn"
                  onClick={handlePayment}
                  disabled={loadingUser}
                >
                  {loadingUser ? (
                    "Loading..."
                  ) : (
                    <>
                      <i className="bi bi-lock-fill me-2"></i>
                      Proceed to Secure Payment
                      <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </button>

                {/* BACK */}
                <button
                  className="fc-back-btn"
                  onClick={() => navigate("/checkout")}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Checkout
                </button>

                {/* PAYMENT TRUST */}
                <div className="fc-payment-trust">
                  <i className="bi bi-shield-check"></i>
                  Secure payment powered by PayFast
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SecureCheckout;
