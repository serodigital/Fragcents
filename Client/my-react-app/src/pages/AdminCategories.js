import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth";

const AdminCategories = () => {
  const { auth } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/categories");
      if (data.categories) {
        setCategories(data.categories);
      } else {
        toast.error("No categories found.");
      }
    } catch (error) {
      toast.error("Error fetching categories.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategory.trim()) {
      toast.error("Please write a category name.");
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/categories",
        { name: newCategory, description: newDescription },
        { headers: { Authorization: auth.token } },
      );
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Category created successfully");
        setNewCategory("");
        setNewDescription("");
        fetchCategories();
      }
    } catch (error) {
      toast.error("Error creating category.");
    }
  };

  const handleUpdate = async (id) => {
    try {
      const { data } = await axios.put(
        `http://localhost:8000/api/categories/${id}`,
        { name: editName, description: editDescription },
        { headers: { Authorization: auth.token } },
      );
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Category updated successfully");
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      toast.error("Error updating category.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:8000/api/categories/${id}`,
        { headers: { Authorization: auth.token } },
      );
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Category deleted successfully");
        fetchCategories();
      }
    } catch (error) {
      toast.error("Error deleting category.");
    }
  };

  return (
    <div className="card">
      <Toaster position="top-right" />
      <div className="card-header bg-primary text-white">Manage Categories</div>
      <div className="card-body">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Write category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Write category description"
          rows="2"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        ></textarea>
        <button className="btn btn-primary mb-4" onClick={handleCreate}>
          Submit
        </button>

        <hr />

        <div className="d-flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map((category) =>
              editingCategory === category._id ? (
                <div
                  key={category._id}
                  className="d-flex flex-column gap-1 border rounded p-2"
                  style={{ width: "220px" }}
                >
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  ></textarea>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdate(category._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingCategory(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={category._id}
                  className="border rounded p-2"
                  style={{ minWidth: "160px" }}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-pill"
                      onClick={() => {
                        setEditingCategory(category._id);
                        setEditName(category.name);
                        setEditDescription(category.description || "");
                      }}
                    >
                      {category.name}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-pill ms-1"
                      onClick={() => handleDelete(category._id)}
                      title="Delete"
                    >
                      &times;
                    </button>
                  </div>
                  {category.description && (
                    <small className="text-muted d-block mt-1">
                      {category.description}
                    </small>
                  )}
                </div>
              ),
            )
          ) : (
            <p className="text-muted">No categories yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
