import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth"; 

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editingUser, setEditingUser] = useState(null); 

  const navigate = useNavigate();
  const { auth } = useAuth(); 

  useEffect(() => {
    if (!auth.token) {
      navigate("/login");
    }
    fetchUsers();
  }, [auth.token, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setUsers(response.data.users); 
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  // Handle input change
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission for adding or updating users
  const handleSubmit = async (event) => {
    event.preventDefault();
    const url = editingUser
      ? `http://localhost:8000/api/users/${editingUser.id}`
      : "http://localhost:8000/api/users";
    const method = editingUser ? "PUT" : "POST";

    try {
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers(); // Refresh the user list after operation
        setFormData({ name: "", email: "", password: "" });
        setEditingUser(null); // Reset editing state
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error("Error while performing operation");
    }
  };

  // Handle editing a user
  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "", 
    });
    setEditingUser(user);
  };

  const handleDelete = async (userId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers(); 
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="container mt-5">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h2 className="text-center mb-4">{editingUser ? "Edit User" : "Add New User"}</h2>
          <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter user's name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter user's email"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter user's password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              {editingUser ? "Update User" : "Add User"}
            </button>
          </form>
        </div>
      </div>

      <div className="row mt-5">
        <h2 className="text-center">User List</h2>
        <div className="col-md-8 col-lg-6">
          <ul className="list-group">
            {users.map((user) => (
              <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                {user.name} ({user.email})
                <div>
                  <button className="btn btn-warning btn-sm mx-2" onClick={() => handleEdit(user)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
