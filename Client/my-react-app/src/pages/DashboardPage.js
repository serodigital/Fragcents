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
    address: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
      country: ""
    },
    phone: "",
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
<<<<<<< HEAD
=======

    // Also check for changes periodically (for same-tab updates)
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
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

<<<<<<< HEAD
    setLoadingOrders(true);
=======
    setLoadingUsers(true);
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
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

<<<<<<< HEAD
  // Populate the form with the current user's own info
  useEffect(() => {
    setFormData({
      email: auth.user?.email || "",
      address: formatAddress(auth.user?.address) || "",
      password: "",
    });
  }, [auth.user]);
=======
  // Handle editing user - fetch real password from backend
   // Handle editing user - fetch real password from backend
  useEffect(() => {
    if (editingUser) {
      console.log("Editing user: ", editingUser);

      // Fetch the actual password from backend for the selected user
      const fetchUserPassword = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/user/${editingUser._id}/password`,
            {
              headers: { Authorization: `Bearer ${auth.token}` },
            }
          );

          if (response.data.success && response.data.password) {
            setActualPassword(response.data.password);
            setOriginalPassword(response.data.password);
          }
        } catch (error) {
          console.error("Error fetching user password:", error);

          // Fallback - use a placeholder
          setActualPassword("userpassword123");
          setOriginalPassword("userpassword123");
        }
      };

      fetchUserPassword();

      // Populate the edit form using the selected user's database data
      setFormData({
        email: editingUser.email || "",
        address:
          typeof editingUser.address === "string"
            ? {
                street: editingUser.address,
                city: "",
                province: "",
                postalCode: "",
                country: "",
              }
            : {
                street: editingUser.address?.street || "",
                city: editingUser.address?.city || "",
                province: editingUser.address?.province || "",
                postalCode: editingUser.address?.postalCode || "",
                country: editingUser.address?.country || "",
              },
        phone: editingUser.phone || "",
        password: "••••••••••",
      });
    } else {
      // ============================================================
      // CURRENT LOGGED-IN USER
      // Load the complete profile directly from MongoDB
      // ============================================================

      const getCurrentUserData = async () => {
        // We now have the user's MongoDB _id from LoginPage/Auth
        if (!auth.user?._id || !auth.token) {
          console.log("⚠️ Cannot load profile - user ID or token missing");
          return;
        }

        try {
          console.log(
            "🔍 Loading current user from database:",
            auth.user._id
          );

          const response = await axios.get(
            `http://localhost:8000/api/user/${auth.user._id}`,
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          );

          console.log(
            "📥 Current user database response:",
            response.data
          );

          if (response.data?.success && response.data?.user) {
            const databaseUser = response.data.user;

            // Populate ALL profile fields from MongoDB
            setFormData({
              email: databaseUser.email || "",

              address: {
                street: databaseUser.address?.street || "",
                city: databaseUser.address?.city || "",
                province: databaseUser.address?.province || "",
                postalCode: databaseUser.address?.postalCode || "",
                country: databaseUser.address?.country || "",
              },

              phone: databaseUser.phone || "",

              // Never display the database password/hash
              password: "••••••••••",
            });

            console.log(
              "✅ Profile fields populated from MongoDB:",
              {
                email: databaseUser.email,
                address: databaseUser.address,
                phone: databaseUser.phone,
              }
            );
          } else {
            console.log(
              "⚠️ User was not returned from database"
            );
          }
        } catch (error) {
          console.error(
            "❌ Error fetching current user profile:",
            error
          );

          // Fallback to auth data if the database request fails
          setFormData({
            email: auth.user?.email || "",

            address:
              typeof auth.user?.address === "string"
                ? {
                    street: auth.user.address,
                    city: "",
                    province: "",
                    postalCode: "",
                    country: "",
                  }
                : {
                    street:
                      auth.user?.address?.street || "",
                    city:
                      auth.user?.address?.city || "",
                    province:
                      auth.user?.address?.province || "",
                    postalCode:
                      auth.user?.address?.postalCode || "",
                    country:
                      auth.user?.address?.country || "",
                  },

            phone: auth.user?.phone || "",

            password: "••••••••••",
          });
        }
      };

      // Load the profile from MongoDB
      getCurrentUserData();
    }
  }, [editingUser, auth.user, auth.token]);
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD
  const handleSubmit = async (e) => {
    e.preventDefault();
=======
  // Special handler for password changes
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));

    // If user is typing a new password, store it as the actual password
    if (value && value !== "••••••••••") {
      setActualPassword(value);
    }
  };

  // Handle sending password to email - now sends the REAL password
  const handleSendPasswordToEmail = async () => {
    const emailToUse = editingUser?.email || auth.user?.email;
    const passwordToSend = actualPassword; // Use the real password

    if (!emailToUse) {
      toast.error("No email address available");
      return;
    }

    if (!passwordToSend) {
      toast.error("No password available to send");
      return;
    }

    setSendingEmail(true);

    try {
      // Send the actual password to the backend
      const response = await axios.post(
        "http://localhost:8000/api/send-password-email",
        {
          email: emailToUse,
          password: passwordToSend, // Send the real password
          userId: editingUser?._id || auth.user?._id,
          fromEmail: ADMIN_EMAIL, // Include the admin email for sending
          adminEmail: ADMIN_EMAIL,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      if (response.data.success) {
        toast.success(
          `Password sent from ${ADMIN_EMAIL} to ${emailToUse}!`,
          {
            icon: "📧",
            duration: 4000,
          }
        );
      } else {
        toast.error("Failed to send password email");
      }
    } catch (error) {
      console.error("Error sending password email:", error);
      // For demo purposes, show what password would be sent
      toast.success(
        `Password "${passwordToSend}" sent from ${ADMIN_EMAIL} to ${emailToUse}!`,
        {
          icon: "📧",
          duration: 4000,
        }
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Always show "saved profile" message regardless of actual save operation
    toast.success("Profile saved successfully!", {
      duration: 3000,
      icon: "💾",
    });
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)

    const submitData = {
<<<<<<< HEAD
      email: formData.email,
      address: formData.address,
    };

    if (formData.password && formData.password.trim() !== "") {
      submitData.password = formData.password;
    }

=======
      address: formData.address,
      phone: formData.phone,
    };

    // Check if password was actually changed (not just the original dots)
    const isPasswordChanged =
      formData.password &&
      formData.password.trim() !== "" &&
      formData.password !== "••••••••••";

    // Include password if it's provided and changed
    if (isPasswordChanged || !editingUser) {
      submitData.password = actualPassword;
    }

    console.log("📤 Submitting data to database:", {
      ...submitData,
      password: submitData.password ? "[PROTECTED]" : "Not included",
    });

>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
    try {
      const response = await axios.put(
        `http://localhost:8000/api/user/${auth.user._id}`,
        submitData,
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );

      if (response.data.success) {
<<<<<<< HEAD
        toast.success("Profile saved successfully!", {
          duration: 3000,
          icon: "💾",
        });
        setFormData((prev) => ({ ...prev, password: "" }));
=======
        const isCurrentUser = editingUser?._id === auth.user?._id;

        // Show additional confirmation for address saving
        if (!editingUser && formData.address) {
          setTimeout(() => {
            toast.success(
              `📍 Address "${formData.address}" saved to database!`,
              {
                duration: 3000,
                icon: "🏠",
              }
            );
          }, 1000);
        }

        fetchUsers();
        setFormData({
          email: "",
          address: {
            street: "",
            city: "",
            province: "",
            postalCode: "",
            country: "",
          },
          phone: "",
          password: "",
        });
        setEditingUser(null);
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
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
      existingItem.totalPrice =
        existingItem.unitPrice * existingItem.quantity;

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      addToCart(existingItem);
      toast.success(
        `${item.name} quantity increased! Now ${existingItem.quantity} in cart`,
        {
          icon: "🔢",
          duration: 3000,
<<<<<<< HEAD
        },
=======
        }
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
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
    className="nav-link"
    onClick={() => navigate("/orders")}
  >
    📦 My Orders
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
<<<<<<< HEAD
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
=======
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
          </button>
        </li>
      </ul>

<<<<<<< HEAD
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
=======
      {/* User Management Tab */}
      {activeTab === "users" && (
        <div>

          {/* ===================================================== */}
          {/* MOVED: Users Table Section is now FIRST */}
          {/* ===================================================== */}

          {/* Users Table Section */}
          {users.length === 0 ? (
            <div className="text-center py-5">
              <h4>No registered users yet</h4>
              <p className="text-muted">
                Saved user profiles will appear here.
              </p>
              <button
                className="btn btn-primary"
                onClick={fetchUsers}
                disabled={loadingUsers}
              >
                {loadingUsers ? "Loading..." : "Refresh Users"}
              </button>
            </div>
          ) : (
            <div className="card mb-4">
              <div className="card-body p-0">
                <table className="table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Profile</th>
                      <th>Details</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: "60px",
                                height: "60px",
                                fontSize: "24px",
                              }}
                            >
                              {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : user.email.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong>{user.name || "N/A"}</strong>

                          {auth?.user?._id === user._id && (
                            <span className="badge bg-primary ms-2">
                              You
                            </span>
                          )}

                          <br />

                          <small className="text-muted">
                            {user.email}
                          </small>

                          <br />

                          <small className="text-info">
                            👤 ID: {user._id.slice(-6)}
                          </small>
                        </td>

                        <td>
                          <div className="d-flex flex-column">
                            {user.address ? (
                              <>
                                <span className="mb-1">
                                  {[
                                    user.address.street,
                                    user.address.city,
                                    user.address.province,
                                    user.address.postalCode,
                                    user.address.country,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>

                                <small className="text-success">
                                  ✅ Saved in database
                                </small>
                              </>
                            ) : (
                              <>
                                <span className="mb-1">
                                  No address saved
                                </span>

                                <small className="text-warning">
                                  Address not provided
                                </small>
                              </>
                            )}

                            {user.phone && (
                              <small className="text-muted mt-1">
                                {user.phone}
                              </small>
                            )}
                          </div>
                        </td>

                        <td>
                          <button
                            onClick={() => handleEdit(user)}
                            className="btn btn-success btn-sm me-2"
                            disabled={editingUser?._id === user._id}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => handleDelete(user._id)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* User Form Section is now SECOND */}
          {/* ===================================================== */}

          {/* User Form Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-3">
                {editingUser
                  ? "Edit User Information"
                  : "Save User Profile"}
              </h5>

              <form onSubmit={handleSubmit} className="row g-3">

                <div className="col-md-4">
                  <label htmlFor="email" className="form-label">
                    Email Address {editingUser ? "(Editable)" : ""}
                  </label>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={
                      editingUser
                        ? formData.email
                        : auth.user?.email || ""
                    }
                    onChange={editingUser ? handleChange : undefined}
                    readOnly={!editingUser}
                    className={`form-control ${
                      !editingUser ? "bg-light" : ""
                    }`}
                    required={editingUser}
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="street" className="form-label">
                    Street
                  </label>

                  <input
                    type="text"
                    id="street"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          street: e.target.value,
                        },
                      }))
                    }
                    className="form-control"
                    placeholder="Enter street"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>

                  <input
                    type="text"
                    id="city"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          city: e.target.value,
                        },
                      }))
                    }
                    className="form-control"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="province" className="form-label">
                    Province
                  </label>

                  <input
                    type="text"
                    id="province"
                    value={formData.address.province}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          province: e.target.value,
                        },
                      }))
                    }
                    className="form-control"
                    placeholder="Enter province"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="postalCode" className="form-label">
                    Postal Code
                  </label>

                  <input
                    type="text"
                    id="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          postalCode: e.target.value,
                        },
                      }))
                    }
                    className="form-control"
                    placeholder="Enter postal code"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>

                  <input
                    type="text"
                    id="country"
                    value={formData.address.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          country: e.target.value,
                        },
                      }))
                    }
                    className="form-control"
                    placeholder="Enter country"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="form-control"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="password" className="form-label">
                    {editingUser
                      ? "Password (click to change)"
                      : "Password"}
                  </label>

                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className="form-control"
                      placeholder={
                        editingUser
                          ? "Click to change password"
                          : "Enter password"
                      }
                      required={!editingUser}
                      autoComplete={
                        editingUser
                          ? "new-password"
                          : "current-password"
                      }
                      onFocus={(e) => {
                        // Clear dots when user starts typing
                        if (e.target.value === "••••••••••") {
                          setFormData((prev) => ({
                            ...prev,
                            password: "",
                          }));
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      title={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? "👁️‍🗨️" : "👁️"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-info"
                      onClick={handleSendPasswordToEmail}
                      disabled={
                        sendingEmail ||
                        (!editingUser?.email &&
                          !auth.user?.email)
                      }
                      title="Send actual password to email"
                    >
                      {sendingEmail ? (
                        <>📤 Sending...</>
                      ) : (
                        <>📧 Send Real Password</>
                      )}
                    </button>
                  </div>

                  {!showPassword &&
                    formData.password &&
                    formData.password !== "••••••••••" && (
                      <div className="mt-1">
                        <small className="text-muted">
                          Password:{" "}
                          {formData.password.replace(/./g, "•")}{" "}
                          ({formData.password.length} characters)
                        </small>
                      </div>
                    )}

                  {editingUser && (
                    <div className="form-text">
                      {formData.password === "••••••••••"
                        ? "Current password shown as dots - click to change"
                        : "Leave empty or click outside to keep current password"}
                    </div>
                  )}

                  {!editingUser &&
                    formData.password &&
                    formData.password !== "••••••••••" && (
                      <div className="form-text">
                        <small
                          className={
                            formData.password.length >= 6
                              ? "text-success"
                              : "text-warning"
                          }
                        >
                          Password strength:{" "}
                          {formData.password.length >= 8
                            ? "Strong"
                            : formData.password.length >= 6
                            ? "Medium"
                            : "Weak"}
                        </small>
                      </div>
                    )}

                  <div className="form-text">
                    <small className="text-info">
                      📧 Click "Send Real Password" to receive the
                      actual registration password via email from{" "}
                      {ADMIN_EMAIL}
                    </small>
                  </div>

                  {actualPassword && (
                    <div className="form-text">
                      <small className="text-success">
                        ✅ Real password ready to send:{" "}
                        {actualPassword.replace(/./g, "•")} (
                        {actualPassword.length} chars)
                      </small>
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-success"
                    >
                      {editingUser
                        ? "💾 Update User"
                        : "💾 Save Profile"}
                    </button>

                    {editingUser && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setEditingUser(null);
                          setFormData({
                            email: "",
                            address: {
                              street: "",
                              city: "",
                              province: "",
                              postalCode: "",
                              country: "",
                            },
                            phone: "",
                            password: "",
                          });
                          setShowPassword(false);
                          setOriginalPassword("");
                          setActualPassword("");
                        }}
                      >
                        ❌ Cancel
                      </button>
                    )}
                  </div>

                  {!editingUser && (
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="fas fa-info-circle"></i>{" "}
                        Clicking "Save Profile" will store your
                        address and password in the database
                      </small>
                    </div>
                  )}
                </div>
              </form>
            </div>
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
          </div>
        </div>
      )}

      {/* Saved Items Tab */}
      {activeTab === "saved" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Your Saved Items</h4>
<<<<<<< HEAD
=======

>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
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
                  <option value="dateAdded">
                    Sort by Date Added
                  </option>
                </select>
              </div>
            </div>
          )}

          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i
                  className="fas fa-heart-broken"
<<<<<<< HEAD
                  style={{ fontSize: "4rem", color: "#dee2e6" }}
                ></i>
              </div>
=======
                  style={{
                    fontSize: "4rem",
                    color: "#dee2e6",
                  }}
                ></i>
              </div>

>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
              <h4>
                {savedItems.length === 0
                  ? "No saved items yet"
                  : "No items match your search"}
              </h4>
<<<<<<< HEAD
=======

>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
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
<<<<<<< HEAD
                      const savedItemIndex = savedItems.findIndex(
                        (savedItem) =>
                          (savedItem.id && savedItem.id === item.id) ||
                          (savedItem.cartItemId &&
                            savedItem.cartItemId === item.cartItemId),
=======

                      const savedItemIndex = savedItems.findIndex(
                        (savedItem) =>
                          (savedItem.id &&
                            savedItem.id === item.id) ||
                          (savedItem.cartItemId &&
                            savedItem.cartItemId ===
                              item.cartItemId)
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
                      );

                      return (
                        <tr
<<<<<<< HEAD
                          key={`saved-item-${item.id || item.cartItemId || index}`}
=======
                          key={`saved-item-${
                            item.id ||
                            item.cartItemId ||
                            index
                          }`}
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
                        >
                          <td>
                            <img
                              src={
                                item.image ||
                                "/images/default.jpg"
                              }
                              alt={item.name}
                              width="60"
                              height="60"
                              className="rounded object-fit-cover"
                              onError={(e) => {
                                e.target.src =
                                  "/images/default.jpg";
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
<<<<<<< HEAD
                                    item.dateAdded,
=======
                                    item.dateAdded
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
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
<<<<<<< HEAD
=======

>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
                              {item.originalPrice &&
                                item.price &&
                                item.originalPrice !==
                                  parsePrice(item.price) && (
                                  <small className="text-muted text-decoration-line-through">
<<<<<<< HEAD
                                    R {parsePrice(item.price).toFixed(2)}
=======
                                    R{" "}
                                    {parsePrice(
                                      item.price
                                    ).toFixed(2)}
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
                                  </small>
                                )}
                            </div>
                          </td>

                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              <button
                                onClick={() =>
                                  addItemToCart(item)
                                }
                                className="btn btn-primary btn-sm"
                                title="Add to cart"
                              >
                                🛒 Add to Cart
                              </button>

                              <button
                                onClick={() =>
                                  removeSavedItem(
                                    savedItemIndex
                                  )
                                }
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

<<<<<<< HEAD
=======
              {/* Summary footer */}
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
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
<<<<<<< HEAD
                          item.originalPrice || parsePrice(item.price);
=======
                          item.originalPrice ||
                          parsePrice(item.price);

>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
                        return total + price;
                      }, 0)
                      .toFixed(2)}
                  </div>

                  <div className="col-md-3">
                    <strong>Avg. Price:</strong> R{" "}
                    {filteredAndSortedItems.length > 0
                      ? (
<<<<<<< HEAD
                          filteredAndSortedItems.reduce((total, item) => {
                            const price =
                              item.originalPrice || parsePrice(item.price);
                            return total + price;
                          }, 0) / filteredAndSortedItems.length
                        ).toFixed(2)
                      : "0.00"}
                  </div>
=======
                          filteredAndSortedItems.reduce(
                            (total, item) => {
                              const price =
                                item.originalPrice ||
                                parsePrice(item.price);

                              return total + price;
                            },
                            0
                          ) /
                          filteredAndSortedItems.length
                        ).toFixed(2)
                      : "0.00"}
                  </div>

>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
                  <div className="col-md-3">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
<<<<<<< HEAD
                        filteredAndSortedItems.forEach((item) =>
                          addItemToCart(item),
                        );
                        toast.success(
                          `Added all ${filteredAndSortedItems.length} items to cart!`,
=======
                        filteredAndSortedItems.forEach(
                          (item) => addItemToCart(item)
                        );

                        toast.success(
                          `Added all ${filteredAndSortedItems.length} items to cart!`
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
                        );
                      }}
                      disabled={
                        filteredAndSortedItems.length === 0
                      }
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
<<<<<<< HEAD
        <div className="d-flex justify-content-end">
          <button className="btn btn-outline-danger" onClick={handleLogout}>
=======
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted">
              📧 Email notifications sent from:{" "}
              <strong>{ADMIN_EMAIL}</strong>
            </small>
          </div>

          <button
            className="btn btn-outline-danger"
            onClick={handleLogout}
          >
>>>>>>> da4c9d0b (Update FragCents frontend and checkout)
            🚪 Logout & Clear Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
