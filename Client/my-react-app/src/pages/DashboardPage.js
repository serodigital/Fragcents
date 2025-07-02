import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth";

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    address: "",
    password: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      console.log("Fetched users: ", response.data); // Debugging: Log the fetched users

      if (response.data && response.data.users) {
        setUsers(response.data.users);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        navigate("/login");
      } else {
        toast.error("Error fetching users.");
      }
    } finally {
      setLoading(false);
    }
  }, [auth.token, logout, navigate]);

  useEffect(() => {
    if (!auth.token) {
      navigate("/login");
    } else {
      fetchUsers();
    }
  }, [auth.token, navigate, fetchUsers]);

  useEffect(() => {
    if (editingUser) {
      // Log the user data when editing
      console.log("Editing user: ", editingUser);
      setFormData({
        email: editingUser.email,  // Ensure this sets the correct email
        address: editingUser.address || "",
        password: "",
      });
    }
  }, [editingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingUser
      ? `http://localhost:8000/api/user/${editingUser._id}`
      : "http://localhost:8000/api/user";
    const method = editingUser ? "PUT" : "POST";

    try {
      const response = await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
        setFormData({ email: "", address: "", password: "" });
        setEditingUser(null);
      } else {
        toast.error("Operation failed.");
      }
    } catch (error) {
      toast.error("Error while performing operation.");
    }
  };

  const handleEdit = (user) => {
    // Log the user data to make sure it's being passed correctly to the edit function
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

  return (
    <div className="container mt-5">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="mb-3">
            <span className="h4">Hello, {auth.user?.name}</span>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email (uneditable)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={auth.user?.email} // Now using the email from auth context
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter address"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Change password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                {editingUser ? "Update Info" : "Add User"}
              </button>
            </form>

            <div className="mt-4">
              <h3>Users List</h3>
              {loading ? (
                <p>Loading users...</p>
              ) : (
                <ul className="list-group">
                  {users.length === 0 ? (
                    <li className="list-group-item">No users found.</li>
                  ) : (
                    users.map((user) => (
                      <li key={user._id} className="list-group-item">
                        <span>{user.email}</span>
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn btn-sm btn-warning float-end mx-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="btn btn-sm btn-danger float-end"
                        >
                          Delete
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;





