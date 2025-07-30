import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth"; //Import Auth Context

const AdminCategories = () => {
  const { auth } = useAuth(); //Call useAuth at the top level
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/categories"
      );

      if (data.categories) {
        setCategories(data.categories); // Ensure correct data mapping
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

  // Create Category
  const handleCreate = async () => {
    try {
      const { data } = await axios.post("http://localhost:8000/api/categories",
        { name: newCategory },
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Category created successfully");
        setNewCategory("");
        fetchCategories();
      }
    } catch (error) {
      toast.error("Error creating category.");
      console.log("JWT Token:", auth.token);
    }
  };

  // Update Category
  const handleUpdate = async (id) => {
    try {
      const { data } = await axios.put(`http://localhost:8000/api/categories/${id}`, { name: editName },
        {
          headers: {
            Authorization: auth.token,
          },
        }
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

  // Delete Category
  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`http://localhost:8000/api/categories/${id}`,
        {
          headers: {
            Authorization: auth.token,
          },
        }
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
    <div className="container mt-5">
      <Toaster position="top-right" />
      <h3>Manage Categories</h3>

      {/* Add Category Form */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="New Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreate}>
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((category) => (
              <tr key={category._id}>
                <td>
                  {editingCategory === category._id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td>
                  {editingCategory === category._id ? (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
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
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => {
                          setEditingCategory(category._id);
                          setEditName(category.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(category._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCategories;
