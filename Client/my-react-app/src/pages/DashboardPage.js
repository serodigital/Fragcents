import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/Auth";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const formatAddress = (address) => {
  if (!address) return null;
  if (typeof address === "string") return address;
  return [
    address.street || address.address,
    address.city,
    address.province,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { auth, logout, authLoading } = useAuth();

  // State for the logged-in user's own profile form
  const [formData, setFormData] = useState({
    email: "",
    address: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // State for wishlist
  const [savedItems, setSavedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // State for tabs
  const [activeTab, setActiveTab] = useState("profile");

  // State for my orders
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch saved items from localStorage with real-time updates
  const fetchSavedItems = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("savedItems") || "[]");
      setSavedItems(saved);
    } catch (error) {
      console.error("Error parsing saved items:", error);
      setSavedItems([]);
    }
  }, []);

  // Listen for localStorage changes (when items are saved from other components)
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

  // Clear user personal data on logout
  const clearUserData = useCallback(() => {
    setSavedItems([]);
    localStorage.removeItem("savedItems");
    localStorage.removeItem("cart");
    setFormData({ email: "", address: "", password: "" });
    setSearchTerm("");
    setSortBy("name");
    setShowPassword(false);
  }, []);

  // Handle explicit logout
  const handleLogout = useCallback(() => {
    toast.success("Logging out and clearing personal data...");
    clearUserData();
    logout();
    navigate("/login");
  }, [clearUserData, logout, navigate]);

  // Fetch the logged-in user's own orders
  const fetchMyOrders = useCallback(async () => {
    if (!auth.token) return;

    setLoadingOrders(true);
    try {
      const response = await axios.get("http://localhost:8000/api/order/mine", {
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

  // Initial setup and logout handling
  useEffect(() => {
    if (authLoading) return;

    if (!auth.token) {
      clearUserData();
      navigate("/login");
    } else {
      fetchSavedItems();
    }
  }, [auth.token, authLoading, navigate, fetchSavedItems, clearUserData]);

  // Monitor auth state changes for logout detection
  useEffect(() => {
    const prevAuthState = sessionStorage.getItem("prevAuthState");
    const currentAuthState = auth.token ? "logged-in" : "logged-out";

    if (prevAuthState === "logged-in" && currentAuthState === "logged-out") {
      clearUserData();
      toast.success("Wishlist cleared on logout");
    }

    sessionStorage.setItem("prevAuthState", currentAuthState);
  }, [auth.token, clearUserData]);

  // Populate the form with the current user's own info
  useEffect(() => {
    setFormData({
      email: auth.user?.email || "",
      address: formatAddress(auth.user?.address) || "",
      password: "",
    });
  }, [auth.user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      email: formData.email,
      address: formData.address,
    };

    if (formData.password && formData.password.trim() !== "") {
      submitData.password = formData.password;
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/api/user/${auth.user._id}`,
        submitData,
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );

      if (response.data.success) {
        toast.success("Profile saved successfully!", {
          duration: 3000,
          icon: "💾",
        });
        setFormData((prev) => ({ ...prev, password: "" }));
        setShowPassword(false);
      } else {
        toast.error(response.data.message || "Failed to save profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Something went wrong while saving your profile.");
    }
  };

  // Wishlist handlers
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
        {
          icon: "🔢",
          duration: 3000,
        },
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
      toast.success(`${item.name} added to cart!`, {
        icon: "🛒",
        duration: 3000,
      });
    }
  };

  const filteredAndSortedItems = savedItems
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category &&
          item.category.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price": {
          const priceA = a.originalPrice || parsePrice(a.price);
          const priceB = b.originalPrice || parsePrice(b.price);
          return priceA - priceB;
        }
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        case "dateAdded":
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="container mt-5">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mb-4">
        <h2 className="mb-2">📊 Dashboard</h2>
        <div className="alert alert-success" role="alert">
          <strong>Welcome back, {auth.user?.name}!</strong> You are now viewing
          the dashboard.
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 My Profile
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("saved");
              fetchSavedItems();
            }}
          >
            ❤️ Saved Items ({savedItems.length})
            {savedItems.length === 0 && (
              <span className="text-muted"> - Empty</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("orders");
              fetchMyOrders();
            }}
          >
            📦 My Orders ({myOrders.length})
          </button>
        </li>
      </ul>

      {/* My Profile Tab */}
      {activeTab === "profile" && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-3">My Profile</h5>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-4">
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
              <div className="col-md-4">
                <label htmlFor="address" className="form-label">
                  Address{" "}
                  <span className="text-success">
                    (Will be saved to database)
                  </span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your complete address"
                />
              </div>
              <div className="col-md-4">
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
                    placeholder="Leave blank to keep current password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
                <div className="form-text">
                  Leave empty to keep your current password unchanged.
                </div>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-success">
                  💾 Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saved Items Tab */}
      {activeTab === "saved" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Your Saved Items</h4>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={fetchSavedItems}
              title="Refresh saved items"
            >
              🔄 Refresh
            </button>
          </div>

          {savedItems.length > 0 && (
            <div className="card mb-4">
              <div className="card-body d-flex justify-content-between">
                <input
                  type="text"
                  className="form-control me-3"
                  placeholder="Search saved items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ maxWidth: "200px" }}
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
            <div className="text-center py-5">
              <div className="mb-4">
                <i
                  className="fas fa-heart-broken"
                  style={{ fontSize: "4rem", color: "#dee2e6" }}
                ></i>
              </div>
              <h4>
                {savedItems.length === 0
                  ? "No saved items yet"
                  : "No items match your search"}
              </h4>
              <p className="text-muted">
                {savedItems.length === 0
                  ? "Items you save for later will appear here."
                  : "Try adjusting your search terms or filters."}
              </p>
              {savedItems.length === 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/shop")}
                >
                  Browse Products
                </button>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "80px" }}>Image</th>
                      <th>Details</th>
                      <th style={{ width: "120px" }}>Price</th>
                      <th style={{ width: "200px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedItems.map((item, index) => {
                      const price =
                        item.originalPrice || parsePrice(item.price);
                      const savedItemIndex = savedItems.findIndex(
                        (savedItem) =>
                          (savedItem.id && savedItem.id === item.id) ||
                          (savedItem.cartItemId &&
                            savedItem.cartItemId === item.cartItemId),
                      );

                      return (
                        <tr
                          key={`saved-item-${item.id || item.cartItemId || index}`}
                        >
                          <td>
                            <img
                              src={item.image || "/images/default.jpg"}
                              alt={item.name}
                              width="60"
                              height="60"
                              className="rounded object-fit-cover"
                              onError={(e) => {
                                e.target.src = "/images/default.jpg";
                              }}
                            />
                          </td>
                          <td>
                            <strong>{item.name}</strong>
                            <br />
                            <small className="text-muted">
                              {typeof item.category === "string"
                                ? item.category
                                : item.category?.name || "Uncategorized"}
                            </small>
                            {item.dateAdded && (
                              <>
                                <br />
                                <small className="text-muted">
                                  Saved:{" "}
                                  {new Date(
                                    item.dateAdded,
                                  ).toLocaleDateString()}
                                </small>
                              </>
                            )}
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <strong className="text-success">
                                R {price.toFixed(2)}
                              </strong>
                              {item.originalPrice &&
                                item.price &&
                                item.originalPrice !==
                                  parsePrice(item.price) && (
                                  <small className="text-muted text-decoration-line-through">
                                    R {parsePrice(item.price).toFixed(2)}
                                  </small>
                                )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              <button
                                onClick={() => addItemToCart(item)}
                                className="btn btn-primary btn-sm"
                                title="Add to cart"
                              >
                                🛒 Add to Cart
                              </button>
                              <button
                                onClick={() => removeSavedItem(savedItemIndex)}
                                className="btn btn-outline-danger btn-sm"
                                title="Remove from saved items"
                              >
                                🗑️ Remove
                              </button>
                              {item.productUrl && (
                                <a
                                  href={item.productUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-info btn-sm"
                                  title="View product details"
                                >
                                  👁️ View
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="card-footer bg-light">
                <div className="row text-center">
                  <div className="col-md-3">
                    <strong>Total Items:</strong>{" "}
                    {filteredAndSortedItems.length}
                  </div>
                  <div className="col-md-3">
                    <strong>Total Value:</strong> R{" "}
                    {filteredAndSortedItems
                      .reduce((total, item) => {
                        const price =
                          item.originalPrice || parsePrice(item.price);
                        return total + price;
                      }, 0)
                      .toFixed(2)}
                  </div>
                  <div className="col-md-3">
                    <strong>Avg. Price:</strong> R{" "}
                    {filteredAndSortedItems.length > 0
                      ? (
                          filteredAndSortedItems.reduce((total, item) => {
                            const price =
                              item.originalPrice || parsePrice(item.price);
                            return total + price;
                          }, 0) / filteredAndSortedItems.length
                        ).toFixed(2)
                      : "0.00"}
                  </div>
                  <div className="col-md-3">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        filteredAndSortedItems.forEach((item) =>
                          addItemToCart(item),
                        );
                        toast.success(
                          `Added all ${filteredAndSortedItems.length} items to cart!`,
                        );
                      }}
                      disabled={filteredAndSortedItems.length === 0}
                    >
                      🛒 Add All to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Orders Tab */}
      {activeTab === "orders" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>My Orders</h4>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={fetchMyOrders}
              disabled={loadingOrders}
            >
              {loadingOrders ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="text-center py-5">
              <h4>No orders yet</h4>
              <p className="text-muted">Orders you place will appear here.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/shop")}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Order</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <small className="text-muted">
                            #{order._id.slice(-6)}
                          </small>
                        </td>
                        <td>
                          {(order.products || []).map((item, i) => (
                            <div key={i}>
                              <small>
                                {item.quantity}x {item.name}
                              </small>
                            </div>
                          ))}
                        </td>
                        <td>
                          <strong>R{order.totalAmount.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span
                            className={`badge text-capitalize ${
                              order.orderStatus === "delivered"
                                ? "bg-success"
                                : order.orderStatus === "shipped"
                                  ? "bg-info"
                                  : order.orderStatus === "processing"
                                    ? "bg-primary"
                                    : order.orderStatus === "cancelled"
                                      ? "bg-danger"
                                      : "bg-secondary"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <small>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logout button */}
      <div className="mt-5 pt-4 border-top">
        <div className="d-flex justify-content-end">
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            🚪 Logout & Clear Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
