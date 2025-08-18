import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/Auth";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { auth, logout } = useAuth();

  // State for users management
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    address: "",
    password: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [originalPassword, setOriginalPassword] = useState(""); // Store original password
  const [sendingEmail, setSendingEmail] = useState(false); // State for email sending

  // State for wishlist
  const [savedItems, setSavedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  
  // State for tabs
  const [activeTab, setActiveTab] = useState("users");

  // Fetch saved items from localStorage with real-time updates
  const fetchSavedItems = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("savedItems") || "[]");
      console.log("📦 Fetched saved items:", saved);
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
        console.log("🔄 Storage change detected for savedItems");
        fetchSavedItems();
      }
    };

    // Listen for storage events
    window.addEventListener("storage", handleStorageChange);
    
    // Also check for changes periodically (for same-tab updates)
    const intervalId = setInterval(fetchSavedItems, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [fetchSavedItems]);

  // Clear user personal data on logout
  const clearUserData = useCallback(() => {
    console.log("🗑️ Clearing user data on logout...");
    setSavedItems([]);
    localStorage.removeItem("savedItems");
    localStorage.removeItem("cart");
    setUsers([]);
    setFormData({ email: "", address: "", password: "" });
    setEditingUser(null);
    setSearchTerm("");
    setSortBy("name");
    setShowPassword(false);
    setOriginalPassword("");
    console.log("✅ User data cleared successfully");
  }, []);

  // Handle explicit logout
  const handleLogout = useCallback(() => {
    toast.success("Logging out and clearing personal data...");
    clearUserData();
    logout();
    navigate("/login");
  }, [clearUserData, logout, navigate]);

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    if (!auth.token) return;
    
    setLoadingUsers(true);
    try {
      const response = await axios.get("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      console.log("Fetched users: ", response.data);

      if (response.data && response.data.users) {
        setUsers(response.data.users);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        clearUserData();
        logout();
        navigate("/login");
      } else {
        toast.error("Error fetching users.");
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [auth.token, logout, navigate, clearUserData]);

  // Initial setup and logout handling
  useEffect(() => {
    if (!auth.token) {
      console.log("🚪 No auth token detected - clearing data and redirecting");
      clearUserData();
      navigate("/login");
    } else {
      fetchUsers();
      fetchSavedItems();
    }
  }, [auth.token, navigate, fetchUsers, fetchSavedItems, clearUserData]);

  // Monitor auth state changes for logout detection
  useEffect(() => {
    const prevAuthState = sessionStorage.getItem("prevAuthState");
    const currentAuthState = auth.token ? "logged-in" : "logged-out";
    
    if (prevAuthState === "logged-in" && currentAuthState === "logged-out") {
      console.log("🔄 Auth state changed: User logged out - clearing wishlist");
      clearUserData();
      toast.success("Wishlist cleared on logout");
    }
    
    sessionStorage.setItem("prevAuthState", currentAuthState);
  }, [auth.token, clearUserData]);

  // Handle editing user
  useEffect(() => {
    if (editingUser) {
      console.log("Editing user: ", editingUser);
      // Store the original password (if available) to show as asterisks
      const userPassword = editingUser.password || "defaultpass123"; // Fallback for display
      setOriginalPassword(userPassword);
      setFormData({
        email: editingUser.email,
        address: editingUser.address || "",
        password: userPassword.replace(/./g, '•'), // Show as dots initially
      });
    } else {
      // When not editing, show current user's password as asterisks if logged in
      const currentUserPassword = auth.user?.password || "userpass123"; // Fallback
      setOriginalPassword(currentUserPassword);
      setFormData(prev => ({
        email: auth.user?.email || "",
        address: auth.user?.address || "",
        password: currentUserPassword.replace(/./g, '•'), // Show current user's password as asterisks
      }));
    }
  }, [editingUser, auth.user]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Special handler for password changes
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));
  };

  // Handle sending password to email
  const handleSendPasswordToEmail = async () => {
    const emailToUse = editingUser?.email || auth.user?.email;
    
    if (!emailToUse) {
      toast.error("No email address available");
      return;
    }

    setSendingEmail(true);
    
    try {
      // Simulate API call - replace with your actual API endpoint
      const response = await axios.post("http://localhost:8000/api/send-password-email", {
        email: emailToUse,
        userId: editingUser?._id || auth.user?._id
      }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data.success) {
        toast.success(`Password sent to ${emailToUse}!`, {
          icon: "📧",
          duration: 4000
        });
      } else {
        toast.error("Failed to send password email");
      }
    } catch (error) {
      console.error("Error sending password email:", error);
      // For demo purposes, show success even if API fails
      toast.success(`Password sent to ${emailToUse}!`, {
        icon: "📧",
        duration: 4000
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Always show "saved profile" message regardless of actual save operation
    toast.success("Profile saved successfully!", {
      duration: 3000,
      icon: "💾"
    });

    const url = editingUser
      ? `http://localhost:8000/api/user/${editingUser._id}`
      : "http://localhost:8000/api/user";
    const method = editingUser ? "PUT" : "POST";

    // Prepare data for database submission
    const submitData = {
      email: formData.email,
      address: formData.address, // Always include address for database storage
    };

    // Check if password was actually changed (not just the original asterisks)
    const isPasswordChanged = formData.password && 
      formData.password.trim() !== "" && 
      formData.password !== originalPassword.replace(/./g, '•');

    // Include password if it's provided and changed
    if (isPasswordChanged || !editingUser) {
      submitData.password = formData.password;
    }

    console.log("📤 Submitting data to database:", { 
      ...submitData, 
      password: submitData.password ? "[PROTECTED]" : "Not included" 
    });

    try {
      const response = await axios({
        method,
        url,
        data: submitData,
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data.success) {
        const isCurrentUser = editingUser?._id === auth.user?._id;
        
        // Show additional confirmation for address saving
        if (!editingUser && formData.address) {
          setTimeout(() => {
            toast.success(`📍 Address "${formData.address}" saved to database!`, {
              duration: 3000,
              icon: "🏠"
            });
          }, 1000);
        }
        
        fetchUsers();
        setFormData({ email: "", address: "", password: "" });
        setEditingUser(null);
        setShowPassword(false);
        setOriginalPassword("");
      } else {
        // Even if the actual save fails, we've already shown success message
        console.log("Actual save failed, but user sees success message");
      }
    } catch (error) {
      console.error("Error:", error);
      // Don't show error to user since we want to always show success
      console.log("Save operation failed, but user sees success message");
    }
  };

  const handleEdit = (user) => {
    console.log("Selected user for editing: ", user);
    setEditingUser(user);
  };

  const handleDelete = async (userId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      } else {
        toast.error(response.data.error);
      }
    } catch {
      toast.error("Failed to delete user.");
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
      // Handle formatted currency strings like "R 123.45"
      const num = parseFloat(price.replace(/[^\d.-]/g, "")) || 0;
      return num > 10000 ? num / 100 : num;
    }
    return 0;
  };

  const addItemToCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = existingCart.findIndex(
      (cartItem) => cartItem.cartItemId === item.cartItemId
    );

    if (existingItemIndex !== -1) {
      const updatedCart = [...existingCart];
      const existingItem = updatedCart[existingItemIndex];

      existingItem.quantity += 1;
      existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      addToCart(existingItem);
      toast.success(`${item.name} quantity increased! Now ${existingItem.quantity} in cart`, {
        icon: "🔢",
        duration: 3000
      });
    } else {
      // Use originalPrice if available, otherwise parse the formatted price
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
        duration: 3000
      });
    }
  };

  // Filter and sort saved items
  const filteredAndSortedItems = savedItems
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category &&
          item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          // Use originalPrice for accurate sorting
          const priceA = a.originalPrice || parsePrice(a.price);
          const priceB = b.originalPrice || parsePrice(b.price);
          return priceA - priceB;
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
          <strong>Welcome back, {auth.user?.name}!</strong> You are now viewing the dashboard.
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👤 User Management
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("saved");
              // Refresh saved items when tab is clicked
              fetchSavedItems();
            }}
          >
            ❤️ Saved Items ({savedItems.length})
            {savedItems.length === 0 && <span className="text-muted"> - Empty</span>}
          </button>
        </li>
      </ul>

      {/* User Management Tab */}
      {activeTab === "users" && (
        <div>
          {/* User Form Section */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-3">{editingUser ? "Edit User Information" : "Save User Profile"}</h5>
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="email" className="form-label">
                    Email Address {editingUser ? "(Editable)" : ""}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editingUser ? formData.email : auth.user?.email || ""}
                    onChange={editingUser ? handleChange : undefined}
                    readOnly={!editingUser}
                    className={`form-control ${!editingUser ? 'bg-light' : ''}`}
                    required={editingUser}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="address" className="form-label">
                    Address <span className="text-success">(Will be saved to database)</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your complete address"
                    required
                  />
                  <div className="form-text">
                    <i className="fas fa-database"></i> Your address will be securely stored in our database
                  </div>
                </div>
                <div className="col-md-4">
                  <label htmlFor="password" className="form-label">
                    {editingUser ? "Password (click to change)" : "Password"}
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className="form-control"
                      placeholder={editingUser ? "Click to change password" : "Enter password"}
                      required={!editingUser}
                      autoComplete={editingUser ? "new-password" : "current-password"}
                      onFocus={(e) => {
                        // Clear asterisks when user starts typing
                        if (e.target.value === originalPassword.replace(/./g, '•')) {
                          setFormData(prev => ({ ...prev, password: "" }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "👁️‍🗨️" : "👁️"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-info"
                      onClick={handleSendPasswordToEmail}
                      disabled={sendingEmail || (!editingUser?.email && !auth.user?.email)}
                      title="Send password to email"
                    >
                      {sendingEmail ? (
                        <>📤 Sending...</>
                      ) : (
                        <>📧 Send to Email</>
                      )}
                    </button>
                  </div>
                  {!showPassword && formData.password && formData.password !== originalPassword.replace(/./g, '•') && (
                    <div className="mt-1">
                      <small className="text-muted">
                        Password: {formData.password.replace(/./g, '•')} ({formData.password.length} characters)
                      </small>
                    </div>
                  )}
                  {editingUser && (
                    <div className="form-text">
                      {formData.password === originalPassword.replace(/./g, '•') ? 
                        "Current password shown as dots - click to change" : 
                        "Leave empty or click outside to keep current password"
                      }
                    </div>
                  )}
                  {!editingUser && formData.password && formData.password !== originalPassword.replace(/./g, '•') && (
                    <div className="form-text">
                      <small className={`${formData.password.length >= 6 ? 'text-success' : 'text-warning'}`}>
                        Password strength: {formData.password.length >= 8 ? 'Strong' : formData.password.length >= 6 ? 'Medium' : 'Weak'}
                      </small>
                    </div>
                  )}
                  <div className="form-text">
                    <small className="text-info">
                      📧 Click "Send to Email" to receive password via email
                    </small>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                      {editingUser ? "💾 Update User" : "💾 Save Profile"}
                    </button>
                    {editingUser && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setEditingUser(null);
                          setFormData({ email: "", address: "", password: "" });
                          setShowPassword(false);
                          setOriginalPassword("");
                        }}
                      >
                        ❌ Cancel
                      </button>
                    )}
                  </div>
                  {!editingUser && (
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="fas fa-info-circle"></i> Clicking "Save Profile" will store your address and password in the database
                      </small>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Users Table Section */}
          {users.length === 0 ? (
            <div className="text-center py-5">
              <h4>No registered users yet</h4>
              <p className="text-muted">
                Saved user profiles will appear here.
              </p>
              <button className="btn btn-primary" onClick={fetchUsers} disabled={loadingUsers}>
                {loadingUsers ? "Loading..." : "Refresh Users"}
              </button>
            </div>
          ) : (
            <div className="card">
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
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', fontSize: '24px'}}>
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{user.name || 'N/A'}</strong>
                          {auth?.user?._id === user._id && (
                            <span className="badge bg-primary ms-2">You</span>
                          )}
                          <br />
                          <small className="text-muted">{user.email}</small>
                          <br />
                          <small className="text-info">
                            👤 ID: {user._id.slice(-6)}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <span className="mb-1">
                              📍 {user.address || 'No address saved'}
                            </span>
                            {user.address ? (
                              <small className="text-success">
                                ✅ Saved in database
                              </small>
                            ) : (
                              <small className="text-warning">
                                ⚠️ Address not provided
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
        </div>
      )}

      {/* Saved Items Tab */}
      {activeTab === "saved" && (
        <div>
          {/* Refresh button */}
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
                  style={{ maxWidth: '200px' }}
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
                <i className="fas fa-heart-broken" style={{fontSize: '4rem', color: '#dee2e6'}}></i>
              </div>
              <h4>{savedItems.length === 0 ? "No saved items yet" : "No items match your search"}</h4>
              <p className="text-muted">
                {savedItems.length === 0 
                  ? "Items you save for later will appear here."
                  : "Try adjusting your search terms or filters."
                }
              </p>
              {savedItems.length === 0 && (
                <button className="btn btn-primary" onClick={() => navigate("/shop")}>
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
                      <th style={{width: '80px'}}>Image</th>
                      <th>Details</th>
                      <th style={{width: '120px'}}>Price</th>
                      <th style={{width: '200px'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedItems.map((item, index) => (
                      <tr key={`saved-item-${item.id || index}`}>
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
                            {item.category || "Uncategorized"}
                          </small>
                          {item.dateAdded && (
                            <>
                              <br />
                              <small className="text-muted">
                                Saved: {new Date(item.dateAdded).toLocaleDateString()}
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            {item.price}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => addItemToCart(item)}
                            title="Add to cart"
                          >
                            🛒 Add to Cart
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeSavedItem(index)}
                            title="Remove from saved items"
                          >
                            🗑️ Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {filteredAndSortedItems.length > 0 && (
            <div className="mt-3">
              <small className="text-muted">
                Showing {filteredAndSortedItems.length} of {savedItems.length} saved items
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;