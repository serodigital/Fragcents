import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/Auth";
import toast from "react-hot-toast";
import axios from "axios";

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

  // ==============================
  // DELIVERY INFORMATION
  // ==============================

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("South Africa");


  // LOAD LOGGED-IN USER FROM DATABASE
  

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

      // ---------------------------------------------
      // AUTH USER EXISTS
      // ---------------------------------------------

      setLoadingUser(true);

      console.log("=================================");
      console.log("AUTH USER FROM LOCAL STORAGE");
      console.log(auth.user);
      console.log("=================================");

      // Immediately use information available in AuthContext
      setUser(auth.user);

      setName(auth.user.name || "");
      setEmail(auth.user.email || "");

      // If phone happens to exist in AuthContext
      setPhone(auth.user.phone || "");

     
      // MAKE SURE USER ID EXISTS
   

      if (!auth.user._id) {
        console.log("User ID missing from auth.user.");

        setLoadingUser(false);
        return;
      }

      try {
        
        // GET FULL USER PROFILE FROM DATABASE
        

        const response = await axios.get(
          `http://localhost:8000/api/user/${auth.user._id}`,
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

       
        // STORE COMPLETE USER

        setUser(databaseUser);

        
        // CUSTOMER INFORMATION
        

        setName(databaseUser.name || auth.user.name || "");

        setEmail(databaseUser.email || auth.user.email || "");

        setPhone(databaseUser.phone || "");

       
        // DELIVERY ADDRESS
       

        if (typeof databaseUser.address === "string") {
          // Handles old database records where address
          // might be stored as a string.

          setAddress(databaseUser.address);

          setCity("");
          setProvince("");
          setPostalCode("");
          setCountry("South Africa");
        } else {
          // Handles your current MongoDB structure:

          const savedAddress = databaseUser.address || {};

          setAddress(savedAddress.street || "");
          setCity(savedAddress.city || "");
          setProvince(savedAddress.province || "");
          setPostalCode(savedAddress.postalCode || "");
          setCountry(savedAddress.country || "South Africa");
        }

        // ---------------------------------------------
        // DEBUG INFORMATION
        // ---------------------------------------------

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
        console.error("=================================");
        console.error("ERROR LOADING USER PROFILE");
        console.error(error);
        console.error("=================================");

        // ---------------------------------------------
        // FALLBACK TO AUTH CONTEXT
        // ---------------------------------------------

        setName(auth.user.name || "");
        setEmail(auth.user.email || "");
        setPhone(auth.user.phone || "");

        // Do not break guest/user checkout if the
        // profile request fails.
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [auth]);

  // =========================================================
  // PRICE PARSER
  // =========================================================

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

  // =========================================================
  // ITEM TOTAL
  // =========================================================

  const getItemTotal = (item) => {
    return parsePrice(item.price) * (item.quantity || 1);
  };

  // =========================================================
  // SUBTOTAL
  // =========================================================

  const subtotal = cart.reduce((total, item) => {
    return total + getItemTotal(item);
  }, 0);

  // =========================================================
  // DELIVERY FEE
  // =========================================================

  const deliveryFee =
    subtotal >= 200 ? 0 : subtotal > 0 ? 50 : 0;

  // =========================================================
  // TOTAL
  // =========================================================

  const totalPrice = subtotal + deliveryFee;

  // =========================================================
  // PROCEED TO PAYMENT
  // =========================================================

  const handlePayment = async () => {
    // ---------------------------------------------
    // CHECK CART
    // ---------------------------------------------

    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty.");
      navigate("/cart");
      return;
    }

    // ---------------------------------------------
    // CUSTOMER VALIDATION
    // ---------------------------------------------

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

    // ---------------------------------------------
    // ADDRESS VALIDATION
    // ---------------------------------------------

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
      // =================================================
      // CREATE PRODUCTS ARRAY
      // =================================================

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

      // =================================================
      // CUSTOMER OBJECT
      // =================================================

      const customer = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      // =================================================
      // DELIVERY ADDRESS OBJECT
      // =================================================

      const deliveryAddress = {
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      };

      // =================================================
      // ORDER DATA
      // =================================================

      const orderData = {
        // Logged-in user gets their MongoDB _id.
        // Guest checkout gets null.
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

      // =================================================
      // DEBUG
      // =================================================

      console.log("=================================");
      console.log("SECURE CHECKOUT ORDER");
      console.log("=================================");
      console.log(JSON.stringify(orderData, null, 2));
      console.log(
        "CHECKOUT TYPE:",
        user ? "LOGGED-IN USER" : "GUEST USER"
      );
      console.log(
        "USER ID:",
        user?._id || "Guest"
      );
      console.log(
        "CUSTOMER:",
        customer
      );
      console.log(
        "DELIVERY ADDRESS:",
        deliveryAddress
      );
      console.log("=================================");

      // =================================================
      // SAVE ORDER TEMPORARILY
      // =================================================

      localStorage.setItem(
        "pendingOrder",
        JSON.stringify(orderData)
      );

      console.log("Pending order saved successfully.");

      // =================================================
      // GO TO PAYMENT
      // =================================================

      navigate("/payment");
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

      toast.error(
        error.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="container py-5">
      <h2 className="mb-4">Secure Checkout</h2>

      {/* =================================================
          LOADING USER
      ================================================= */}

      {loadingUser && (
        <div className="alert alert-info">
          Loading your saved customer information...
        </div>
      )}

      {/* =================================================
          GUEST MESSAGE
      ================================================= */}

      {!user && !loadingUser && (
        <div className="alert alert-info">
          <strong>Guest Checkout</strong>
          <br />
          You can continue without creating an account.
          Enter your details below.
        </div>
      )}

      {/* =================================================
          LOGGED-IN MESSAGE
      ================================================= */}

      {user && !loadingUser && (
        <div className="alert alert-success">
          <strong>
            Welcome back, {user.name}
          </strong>
          <br />
          Your saved customer information has been loaded
          from your account.
        </div>
      )}

      <div className="row">
        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="col-md-7">
          {/* =================================================
              CUSTOMER INFORMATION
          ================================================= */}

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                Customer Information
              </h5>

              {/* NAME */}

              <div className="mb-3">
                <label className="form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={name}
                  readOnly={!!user}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your full name"
                />
              </div>

              {/* EMAIL */}

              <div className="mb-3">
                <label className="form-label">
                  Email Address
                </label>

                <input
                  type="email"
                  className="form-control"
                  value={email}
                  readOnly={!!user}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email address"
                />
              </div>

              {/* PHONE */}

              <div className="mb-3">
                <label className="form-label">
                  Phone Number
                </label>

                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              DELIVERY INFORMATION
          ================================================= */}

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                Delivery Information
              </h5>

              {/* STREET */}

              <div className="mb-3">
                <label className="form-label">
                  Street Address
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="Enter street address"
                />
              </div>

              {/* CITY */}

              <div className="mb-3">
                <label className="form-label">
                  City
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  placeholder="Enter city"
                />
              </div>

              {/* PROVINCE */}

              <div className="mb-3">
                <label className="form-label">
                  Province
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={province}
                  onChange={(e) =>
                    setProvince(e.target.value)
                  }
                  placeholder="Enter province"
                />
              </div>

              {/* POSTAL CODE */}

              <div className="mb-3">
                <label className="form-label">
                  Postal Code
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={postalCode}
                  onChange={(e) =>
                    setPostalCode(e.target.value)
                  }
                  placeholder="Enter postal code"
                />
              </div>

              {/* COUNTRY */}

              <div className="mb-3">
                <label className="form-label">
                  Country
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={country}
                  onChange={(e) =>
                    setCountry(e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                Order Summary
              </h5>

              {/* =================================================
                  CART ITEMS
              ================================================= */}

              {cart.map((item) => (
                <div
                  key={
                    item.cartItemId ||
                    item._id
                  }
                  className="d-flex justify-content-between border-bottom py-2"
                >
                  <div>
                    <strong>
                      {item.name}
                    </strong>

                    <br />

                    <small className="text-muted">
                      Qty:{" "}
                      {item.quantity || 1}
                    </small>
                  </div>

                  <span>
                    R
                    {getItemTotal(item).toFixed(
                      2
                    )}
                  </span>
                </div>
              ))}

              <hr />

              {/* SUBTOTAL */}

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>

                <span>
                  R{subtotal.toFixed(2)}
                </span>
              </div>

              {/* DELIVERY */}

              <div className="d-flex justify-content-between mb-2">
                <span>Delivery</span>

                <span>
                  {deliveryFee === 0
                    ? "FREE"
                    : `R${deliveryFee.toFixed(
                        2
                      )}`}
                </span>
              </div>

              <hr />

              {/* TOTAL */}

              <div className="d-flex justify-content-between mb-4">
                <strong>Total</strong>

                <strong>
                  R{totalPrice.toFixed(2)}
                </strong>
              </div>

              {/* PAYMENT */}

              <button
                className="btn btn-success w-100"
                onClick={handlePayment}
                disabled={loadingUser}
              >
                {loadingUser
                  ? "Loading..."
                  : "Proceed to Payment"}
              </button>

              {/* BACK */}

              <button
                className="btn btn-outline-secondary w-100 mt-2"
                onClick={() =>
                  navigate("/checkout")
                }
              >
                Back to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureCheckout;