import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth";

const AdminProducts = () => {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    shipping: false,
    photo: null
  });
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    shipping: false,
    photo: null
  });

  // Use useCallback to memoize the fetch functions
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/product");
      if (data.products) {
        setProducts(data.products);
      } else {
        toast.error("No products found.");
      }
    } catch (error) {
      toast.error("Error fetching products.");
      console.error(error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/categories");
      if (data.categories) {
        setCategories(data.categories);
        // Set default category if available
        if (data.categories.length > 0) {
          setFormData(prev => ({ ...prev, category: data.categories[0]._id }));
        }
      }
    } catch (error) {
      toast.error("Error fetching categories.");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]); // Add fetchCategories to the dependency array

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, photo: e.target.files[0] });
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setEditFormData({ ...editFormData, [name]: checked });
    } else if (type === 'file') {
      setEditFormData({ ...editFormData, photo: e.target.files[0] });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  // Create Product
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Using FormData to handle file uploads
      const productFormData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key === 'photo' && formData.photo) {
          productFormData.append('photo', formData.photo);
        } else {
          productFormData.append(key, formData[key]);
        }
      });

      const { data } = await axios.post(
        "http://localhost:8000/api/product",
        productFormData,
        {
          headers: {
            Authorization: auth.token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Product created successfully");
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          category: categories.length > 0 ? categories[0]._id : "",
          quantity: "",
          shipping: false,
          photo: null
        });
        setSelectedImage(null);
        fetchProducts();
      }
    } catch (error) {
      toast.error("Error creating product.");
      console.error(error);
    }
  };

  // Update Product
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `http://localhost:8000/api/product/${editingProduct}`,
        editFormData,
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Product updated successfully");
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (error) {
      toast.error("Error updating product.");
      console.error(error);
    }
  };

  // Delete Product
  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:8000/api/product/${id}`,
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Product deleted successfully");
        fetchProducts();
      }
    } catch (error) {
      toast.error("Error deleting product.");
      console.error(error);
    }
  };

  // Start editing product
  const startEditing = (product) => {
    setEditingProduct(product._id);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      quantity: product.quantity || "",
      shipping: product.shipping || false,
      photo: null // Will be updated if user uploads new photo
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProduct(null);
  };

  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price);
  };

  return (
    <div className="container mt-5">
      <Toaster position="top-right" />
      <h3>Manage Products</h3>

      {/* Add Product Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Add New Product</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreate}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Product Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Description*</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Price*</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="2"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Category*</label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Quantity*</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="shipping"
                    name="shipping"
                    checked={formData.shipping}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="shipping">
                    Shipping Required
                  </label>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Photo</label>
                  <input
                    type="file"
                    className="form-control"
                    name="photo"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  {selectedImage && (
                    <div className="mt-2">
                      <img
                        src={selectedImage}
                        alt="Product preview"
                        style={{ height: "100px" }}
                        className="img-thumbnail"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary">
              Create Product
            </button>
          </form>
        </div>
      </div>

      {/* Products List */}
      <div className="card">
        <div className="card-header">
          <h5>Products List</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Shipping</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td style={{ width: "80px" }}>
                        {product.photo && product.photo.data ? (
                          <img
                            src={`data:${product.photo.contentType};base64,${Buffer.from(
                              product.photo.data
                            ).toString("base64")}`}
                            alt={product.name}
                            style={{ height: "50px" }}
                            className="img-thumbnail"
                          />
                        ) : (
                          <span className="text-muted">No image</span>
                        )}
                      </td>
                      <td>
                        {editingProduct === product._id ? (
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={editFormData.name}
                            onChange={handleEditChange}
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td>
                        {editingProduct === product._id ? (
                          <input
                            type="number"
                            className="form-control"
                            name="price"
                            value={editFormData.price}
                            onChange={handleEditChange}
                            min="2"
                          />
                        ) : (
                          formatPrice(product.price)
                        )}
                      </td>
                      <td>
                        {editingProduct === product._id ? (
                          <select
                            className="form-select"
                            name="category"
                            value={editFormData.category}
                            onChange={handleEditChange}
                          >
                            {categories.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          product.category?.name || "Unknown Category"
                        )}
                      </td>
                      <td>
                        {editingProduct === product._id ? (
                          <input
                            type="number"
                            className="form-control"
                            name="quantity"
                            value={editFormData.quantity}
                            onChange={handleEditChange}
                            min="0"
                          />
                        ) : (
                          product.quantity || "N/A"
                        )}
                      </td>
                      <td>
                        {editingProduct === product._id ? (
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              name="shipping"
                              checked={editFormData.shipping}
                              onChange={handleEditChange}
                            />
                          </div>
                        ) : (
                          product.shipping ? "Yes" : "No"
                        )}
                      </td>
                      <td>
                        {editingProduct === product._id ? (
                          <>
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={handleUpdate}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => startEditing(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(product._id)}
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
                    <td colSpan="7" className="text-center">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;