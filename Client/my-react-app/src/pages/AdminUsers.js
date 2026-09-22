import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth";

const ROLE_LABELS = {
  0: "User",
  1: "Admin",
  2: "Manager",
};

const formatAddress = (address) => {
  if (!address) return "—";
  if (typeof address === "string") return address;
  return (
    [
      address.street || address.address,
      address.city,
      address.province,
      address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ") || "—"
  );
};

const AdminUsers = () => {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/user", {
        headers: { Authorization: auth.token },
      });
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error("No users found.");
      }
    } catch (error) {
      toast.error("Error fetching users.");
    }
  }, [auth.token]);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/orders", {
        headers: { Authorization: auth.token },
      });
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      // Non-fatal if this fails — order counts just won't show
    }
  }, [auth.token]);

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, [fetchUsers, fetchOrders]);

  const getOrderCount = (userId) => {
    return orders.filter((o) => o.user?._id === userId).length;
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await axios.put(
        `http://localhost:8000/api/user/${userId}/role`,
        { role: Number(newRole) },
        { headers: { Authorization: auth.token } },
      );
      if (data.success) {
        toast.success("Role updated successfully");
        fetchUsers();
      } else {
        toast.error(data.message || "Error updating role");
      }
    } catch (error) {
      toast.error("Error updating role.");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:8000/api/user/${userId}`,
        { headers: { Authorization: auth.token } },
      );
      if (data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        toast.error(data.message || "Error deleting user");
      }
    } catch (error) {
      toast.error("Error deleting user.");
    }
  };

  return (
    <div className="card">
      <Toaster position="top-right" />
      <div className="card-header bg-primary text-white">Users</div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Orders</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{formatAddress(user.address)}</td>
                    <td>{getOrderCount(user._id)}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
