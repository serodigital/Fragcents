import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/Auth";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "";

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const emptyAddress = {
  street: "",
  city: "",
  province: "",
  postalCode: "",
  country: "South Africa",
};

// Works with both the new address object and old plain-text addresses
const normalizeAddress = (a) => {
  if (a && typeof a === "object") {
    return {
      street: a.street || "",
      city: a.city || "",
      province: a.province || "",
      postalCode: a.postalCode || "",
      country: a.country || "South Africa",
    };
  }
  return { ...emptyAddress, street: typeof a === "string" ? a : "" };
};

const emptyForm = {
  name: "",
  lastName: "",
  email: "",
  address: { ...emptyAddress },
  password: "",
};

const categoryName = (category) =>
  typeof category === "string" ? category : category?.name || "";

const DetailRow = ({ label, value }) => (
  <div className="d-flex justify-content-between border-bottom py-2">
    <span className="text-muted">{label}</span>
    <span className={value ? "fw-semibold" : "text-muted fst-italic"}>
      {value || "Not added yet"}
    </span>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { auth, setAuth, logout, authLoading } = useAuth();

  // Profile loaded from the database
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [savedItems, setSavedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [activeTab, setActiveTab] = useState("profile");

  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const cartCount = Array.isArray(cart)
    ? cart.reduce((total, item) => total + (Number(item.quantity) || 1), 0)
    : 0;

  // ---------- Saved items ----------
  const fetchSavedItems = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("savedItems") || "[]");
      setSavedItems(saved);
    } catch (error) {
      console.error("Error parsing saved items:", error);
      setSavedItems([]);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "savedItems") {
        fetchSavedItems();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const intervalId = setInterval(fetchSavedItems, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [fetchSavedItems]);

  // ---------- Logout ----------
  const clearUserData = useCallback(() => {
    setSavedItems([]);
    localStorage.removeItem("savedItems");
    localStorage.removeItem("cart");
    setProfile(null);
    setEditing(false);
    setFormData(emptyForm);
    setSearchTerm("");
    setSortBy("name");
    setShowPassword(false);
  }, []);

  const handleLogout = useCallback(() => {
    toast.success("Logging out and clearing personal data...");
    clearUserData();
    logout();
    navigate("/login");
  }, [clearUserData, logout, navigate]);

  // ---------- Load the profile from the database ----------
  const fetchProfile = useCallback(async () => {
    if (!auth.token || !auth.user?._id) return;

    try {
      const { data } = await axios.get(`${API_URL}/api/user/${auth.user._id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (data.success && data.user) {
        setProfile(data.user);
        // Keep the login session (and navbar) in step with the database
        setAuth((prev) => ({
          ...prev,
          user: { ...prev.user, ...data.user },
        }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, [auth.token, auth.user?._id, setAuth]);

  // ---------- Orders ----------
  const fetchMyOrders = useCallback(async () => {
    if (!auth.token) return;

    setLoadingOrders(true);
    try {
      const response = await axios.get(`${API_URL}/api/order/mine`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data && response.data.orders) {
        setMyOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching your orders.");
    } finally {
      setLoadingOrders(false);
    }
  }, [auth.token]);

  // ---------- Setup ----------
  useEffect(() => {
    if (authLoading) return;

    if (!auth.token) {
      clearUserData();
      navigate("/login");
    } else {
      fetchSavedItems();
      fetchMyOrders();
      fetchProfile();
    }
  }, [
    auth.token,
    authLoading,
    navigate,
    fetchSavedItems,
    fetchMyOrders,
    fetchProfile,
    clearUserData,
  ]);

  useEffect(() => {
    const prevAuthState = sessionStorage.getItem("prevAuthState");
    const currentAuthState = auth.token ? "logged-in" : "logged-out";

    if (prevAuthState === "logged-in" && currentAuthState === "logged-out") {
      clearUserData();
      toast.success("Wishlist cleared on logout");
    }

    sessionStorage.setItem("prevAuthState", currentAuthState);
  }, [auth.token, clearUserData]);

  // What to display: the database copy, or the login session until it loads
  const shown = profile || auth.user || {};
  const shownAddress = normalizeAddress(shown.address);

  // ---------- Editing ----------
  const startEditing = () => {
    setFormData({
      name: shown.name || "",
      lastName: shown.lastName || "",
      email: shown.email || "",
      address: normalizeAddress(shown.address),
      password: "",
    });
    setShowPassword(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setShowPassword(false);
    setFormData(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.name.trim()) {
      toast.error("First name is required");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setSaving(true);

    const submitData = {
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      address: formData.address,
    };

    if (formData.password && formData.password.trim() !== "") {
      submitData.password = formData.password;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/user/${auth.user._id}`,
        submitData,
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );

      if (response.data.success) {
        toast.success("Profile saved successfully!");

        setProfile(response.data.user);
        setAuth((prev) => ({
          ...prev,
          user: { ...prev.user, ...response.data.user },
        }));

        setEditing(false);
        setShowPassword(false);
        setFormData(emptyForm);
      } else {
        toast.error(response.data.message || "Failed to save profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong while saving your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------- Wishlist / cart helpers ----------
  const removeSavedItem = (itemIndex) => {
    const updated = savedItems.filter((_, index) => index !== itemIndex);
    setSavedItems(updated);
    localStorage.setItem("savedItems", JSON.stringify(updated));
    toast.success("Item removed from saved items");
  };

  const parsePrice = (price) => {
    if (typeof price === "number") return price > 10000 ? price / 100 : price;
    if (typeof price === "string") {
      const num = parseFloat(price.replace(/[^\d.-]/g, "")) || 0;
      return num > 10000 ? num / 100 : num;
    }
    return 0;
  };

  const addItemToCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = existingCart.findIndex(
      (cartItem) => cartItem.cartItemId === item.cartItemId,
    );

    if (existingItemIndex !== -1) {
      const updatedCart = [...existingCart];
      const existingItem = updatedCart[existingItemIndex];

      existingItem.quantity += 1;
      existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      addToCart(existingItem);
      toast.success(
        `${item.name} quantity increased! Now ${existingItem.quantity} in cart`,
      );
    } else {
      const unitPrice = item.originalPrice || parsePrice(item.price);
      const { cartItemId, ...itemWithoutId } = item;
      const newItem = {
        ...itemWithoutId,
        cartItemId,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
      };

      const updatedCart = [...existingCart, newItem];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      addToCart(newItem);
      toast.success(`${item.name} added to cart!`);
    }
  };

  const filteredAndSortedItems = savedItems
    .filter(
      (item) =>
        (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryName(item.category)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "price": {
          const priceA = a.originalPrice || parsePrice(a.price);
          const priceB = b.originalPrice || parsePrice(b.price);
          return priceA - priceB;
        }
        case "category":
          return categoryName(a.category).localeCompare(
            categoryName(b.category),
          );
        case "dateAdded":
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        default:
          return 0;
      }
    });

  const totalSavedValue = filteredAndSortedItems.reduce(
    (total, item) => total + (item.originalPrice || parsePrice(item.price)),
    0,
  );

  // ---------- Display values ----------
  const firstName = shown.name || "";
  const lastName = shown.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  const addressMissing =
    !shownAddress.street && !shownAddress.city && !shownAddress.postalCode;

  const statusClass = (status) =>
    status === "delivered"
      ? "bg-success"
      : status === "shipped"
        ? "bg-info"
        : status === "processing"
          ? "bg-primary"
          : status === "cancelled"
            ? "bg-danger"
            : "bg-secondary";

  return (
    <div className="container mt-4 mb-5 dash-page">
      <Toaster position="top-right" reverseOrder={false} />

      <style>{`
        .dash-page .dash-hero {
          background: #1c1612;
          color: #f7f1e8;
          border-radius: 16px;
          padding: 24px 28px;
        }
        .dash-page .dash-avatar {
          width: 72px;
          height: 72px;
          min-width: 72px;
          border-radius: 50%;
          background: #957a4a;
          color: #fff;
          font-family: "Playfair Display", serif;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dash-page .dash-hero h2 {
          font-family: "Playfair Display", serif;
          margin: 0;
        }
        .dash-page .dash-hero small { color: #cbbfa9; }
        .dash-page .dash-stat {
          background: #fff;
          border: 1px solid #e6dccb;
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          width: 100%;
          transition: box-shadow 0.15s ease;
        }
        .dash-page .dash-stat:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
        .dash-page .dash-stat .num {
          display: block;
          font-family: "Playfair Display", serif;
          font-size: 1.9rem;
          color: #1c1612;
          line-height: 1.1;
        }
        .dash-page .dash-stat .lbl { color: #7a6a55; font-size: 0.9rem; }
        .dash-page .dash-tabs {
          display: flex;
          gap: 6px;
          border-bottom: 1px solid #e6dccb;
          overflow-x: auto;
        }
        .dash-page .dash-tabs button {
          border: none;
          background: none;
          padding: 10px 18px;
          color: #7a6a55;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
        }
        .dash-page .dash-tabs button.active {
          color: #1c1612;
          font-weight: 600;
          border-bottom-color: #957a4a;
        }
        .dash-page .dash-card {
          background: #fff;
          border: 1px solid #e6dccb;
          border-radius: 14px;
          padding: 24px;
          height: 100%;
        }
        .dash-page .dash-card h5 {
          font-family: "Playfair Display", serif;
          margin-bottom: 16px;
        }
        .dash-page .btn-brand {
          background: #957a4a;
          border: none;
          color: #fff;
          padding: 10px 24px;
          border-radius: 8px;
        }
        .dash-page .btn-brand.btn-sm { padding: 6px 16px; }
        .dash-page .btn-brand:hover:not(:disabled) { background: #7d6639; color: #fff; }
        .dash-page .btn-brand:disabled { opacity: 0.7; }
        .dash-page .btn-outline-brand {
          background: transparent;
          border: 1px solid #957a4a;
          color: #7d6639;
          border-radius: 8px;
        }
        .dash-page .btn-outline-brand:hover { background: #957a4a; color: #fff; }
        .dash-page .saved-img {
          width: 100%;
          height: 190px;
          object-fit: cover;
          border-radius: 12px 12px 0 0;
          background: #f1eadf;
        }
        .dash-page .dash-note {
          background: #f6efe2;
          border: 1px solid #e6dccb;
          color: #6b5a3c;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }
      `}</style>

      {/* Profile header */}
      <div className="dash-hero d-flex align-items-center gap-3 flex-wrap mb-4">
        <div className="dash-avatar">{initials}</div>
        <div className="flex-grow-1">
          <h2>Welcome back, {firstName || "there"}</h2>
          <small>
            {fullName && <span>{fullName} · </span>}
            {shown.email}
          </small>
        </div>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Quick stats */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <button className="dash-stat" onClick={() => setActiveTab("orders")}>
            <span className="num">{myOrders.length}</span>
            <span className="lbl">Orders</span>
          </button>
        </div>
        <div className="col-4">
          <button className="dash-stat" onClick={() => setActiveTab("saved")}>
            <span className="num">{savedItems.length}</span>
            <span className="lbl">Saved items</span>
          </button>
        </div>
        <div className="col-4">
          <button className="dash-stat" onClick={() => navigate("/cart")}>
            <span className="num">{cartCount}</span>
            <span className="lbl">In your cart</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs mb-4">
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          My Profile
        </button>
        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => {
            setActiveTab("orders");
            fetchMyOrders();
          }}
        >
          My Orders ({myOrders.length})
        </button>
        <button
          className={activeTab === "saved" ? "active" : ""}
          onClick={() => {
            setActiveTab("saved");
            fetchSavedItems();
          }}
        >
          Saved Items ({savedItems.length})
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">My Profile</h4>
            {!editing && (
              <button className="btn btn-brand btn-sm" onClick={startEditing}>
                Edit Profile
              </button>
            )}
          </div>

          {/* VIEW MODE */}
          {!editing && (
            <>
              {addressMissing && (
                <div className="dash-note">
                  Your delivery address is empty. Click Edit Profile to add it,
                  so checkout is quicker next time.
                </div>
              )}

              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="dash-card">
                    <h5>Personal Details</h5>
                    <DetailRow label="First name" value={shown.name} />
                    <DetailRow label="Last name" value={shown.lastName} />
                    <DetailRow label="Email" value={shown.email} />
                    <DetailRow label="Password" value="••••••••" />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="dash-card">
                    <h5>Delivery Address</h5>
                    <DetailRow label="Street" value={shownAddress.street} />
                    <DetailRow label="City / Town" value={shownAddress.city} />
                    <DetailRow label="Province" value={shownAddress.province} />
                    <DetailRow
                      label="Postal code"
                      value={shownAddress.postalCode}
                    />
                    <DetailRow label="Country" value={shownAddress.country} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* EDIT MODE */}
          {editing && (
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="dash-card">
                    <h5>Personal Details</h5>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="form-label">
                        New Password (optional)
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Leave blank to keep current"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="dash-card">
                    <h5>Delivery Address</h5>

                    <div className="mb-3">
                      <label htmlFor="street" className="form-label">
                        Street
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.address.street}
                        onChange={handleAddressChange}
                        className="form-control"
                        placeholder="House number and street"
                      />
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="city" className="form-label">
                          City / Town
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.address.city}
                          onChange={handleAddressChange}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="province" className="form-label">
                          Province
                        </label>
                        <select
                          id="province"
                          name="province"
                          value={formData.address.province}
                          onChange={handleAddressChange}
                          className="form-select"
                        >
                          <option value="">Select province</option>
                          {PROVINCES.map((province) => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="postalCode" className="form-label">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={formData.address.postalCode}
                          onChange={handleAddressChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-brand"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">My Orders</h4>
            <button
              className="btn btn-outline-brand btn-sm"
              onClick={fetchMyOrders}
              disabled={loadingOrders}
            >
              {loadingOrders ? "Loading..." : "Refresh"}
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="dash-card text-center py-5">
              <h4>No orders yet</h4>
              <p className="text-muted">Orders you place will appear here.</p>
              <button
                className="btn btn-brand"
                onClick={() => navigate("/shop")}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {myOrders.map((order) => (
                <div className="col-12" key={order._id}>
                  <div className="dash-card">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                      <div>
                        <strong>
                          {order.orderNumber || `#${order._id.slice(-6)}`}
                        </strong>
                        <div className="text-muted small">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`badge text-capitalize ${statusClass(
                          order.orderStatus,
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    {(order.products || []).map((item, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between border-top py-2"
                      >
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                        <span className="text-muted">
                          R{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    <div className="d-flex justify-content-end border-top pt-2">
                      <strong>
                        Total: R{Number(order.totalAmount || 0).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAVED ITEMS TAB */}
      {activeTab === "saved" && (
        <div>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h4 className="mb-0">Your Saved Items</h4>
            {filteredAndSortedItems.length > 0 && (
              <button
                className="btn btn-brand btn-sm"
                onClick={() => {
                  filteredAndSortedItems.forEach((item) => addItemToCart(item));
                  toast.success(
                    `Added all ${filteredAndSortedItems.length} items to cart!`,
                  );
                }}
              >
                Add All to Cart · R{totalSavedValue.toFixed(2)}
              </button>
            )}
          </div>

          {savedItems.length > 0 && (
            <div className="row g-2 mb-4">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search saved items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="category">Sort by Category</option>
                  <option value="dateAdded">Sort by Date Added</option>
                </select>
              </div>
            </div>
          )}

          {filteredAndSortedItems.length === 0 ? (
            <div className="dash-card text-center py-5">
              <h4>
                {savedItems.length === 0
                  ? "No saved items yet"
                  : "No items match your search"}
              </h4>
              <p className="text-muted">
                {savedItems.length === 0
                  ? "Items you save for later will appear here."
                  : "Try adjusting your search terms."}
              </p>
              {savedItems.length === 0 && (
                <button
                  className="btn btn-brand"
                  onClick={() => navigate("/shop")}
                >
                  Browse Products
                </button>
              )}
            </div>
          ) : (
            <div className="row g-4">
              {filteredAndSortedItems.map((item, index) => {
                const price = item.originalPrice || parsePrice(item.price);
                const savedItemIndex = savedItems.findIndex(
                  (savedItem) =>
                    (savedItem.id && savedItem.id === item.id) ||
                    (savedItem.cartItemId &&
                      savedItem.cartItemId === item.cartItemId),
                );

                return (
                  <div
                    className="col-md-6 col-lg-4"
                    key={`saved-item-${item.id || item.cartItemId || index}`}
                  >
                    <div
                      className="dash-card p-0 d-flex flex-column"
                      style={{ overflow: "hidden" }}
                    >
                      <img
                        src={item.image || "/images/default.jpg"}
                        alt={item.name}
                        className="saved-img"
                        onError={(e) => {
                          e.target.src = "/images/default.jpg";
                        }}
                      />
                      <div className="p-3 d-flex flex-column flex-grow-1">
                        <strong>{item.name}</strong>
                        <small className="text-muted">
                          {categoryName(item.category) || "Uncategorized"}
                        </small>
                        <div className="mt-2 mb-3">
                          <strong style={{ color: "#7d6639" }}>
                            R {price.toFixed(2)}
                          </strong>
                        </div>

                        <div className="d-flex gap-2 flex-wrap mt-auto">
                          <button
                            onClick={() => addItemToCart(item)}
                            className="btn btn-brand btn-sm"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removeSavedItem(savedItemIndex)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            Remove
                          </button>
                          {item.productUrl && (
                            <a
                              href={item.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-brand btn-sm"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
