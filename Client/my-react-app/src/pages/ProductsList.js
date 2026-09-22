import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth";

const LOW_STOCK_THRESHOLD = 20;

const ProductsList = () => {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/products");
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      toast.error("Error fetching products.");
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/categories");
      if (data.categories) setCategories(data.categories);
    } catch (error) {
      toast.error("Error fetching categories.");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const startEditing = (product) => {
    setEditingProduct(product._id);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || product.category,
      quantity: product.quantity || "",
      shipping: product.shipping || false,
    });
  };

  const handleUpdate = async () => {
    try {
      const { data } = await axios.put(
        `http://localhost:8000/api/product/${editingProduct}`,
        editFormData,
        { headers: { Authorization: auth.token } },
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
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:8000/api/product/${id}`,
        { headers: { Authorization: auth.token } },
      );
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Product deleted successfully");
        fetchProducts();
      }
    } catch (error) {
      toast.error("Error deleting product.");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZAR",
    }).format(price);

  const lowStockCount = products.filter(
    (p) => (p.quantity ?? 0) < LOW_STOCK_THRESHOLD,
  ).length;

  return (
    <div className="card">
      <Toaster position="top-right" />
      <div className="card-header bg-primary text-white">Products</div>
      <div className="card-body">
        {lowStockCount > 0 && (
          <div className="alert alert-warning py-2 px-3 mb-3" role="alert">
            ⚠️ {lowStockCount} product{lowStockCount > 1 ? "s" : ""} low on
            stock (below {LOW_STOCK_THRESHOLD} units)
          </div>
        )}

        {products.length > 0 ? (
          products.map((product) => {
            const isLowStock = (product.quantity ?? 0) < LOW_STOCK_THRESHOLD;
            return (
              <div
                key={product._id}
                className={`border rounded p-3 mb-3 d-flex gap-3 align-items-start ${
                  isLowStock ? "border-danger" : "border-success"
                }`}
              >
                <img
                  src={`http://localhost:8000/api/product/image/${product._id}`}
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/80?text=No+Image";
                  }}
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  className="rounded"
                />

                <div className="flex-grow-1">
                  {editingProduct === product._id ? (
                    <>
                      <input
                        type="text"
                        className="form-control mb-2"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                      />
                      <textarea
                        className="form-control mb-2"
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditChange}
                      />
                      <input
                        type="number"
                        className="form-control mb-2"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                      />
                      <select
                        className="form-select mb-2"
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
                      <input
                        type="number"
                        className="form-control mb-2"
                        name="quantity"
                        value={editFormData.quantity}
                        onChange={handleEditChange}
                      />
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={handleUpdate}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingProduct(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="mb-0">{product.name}</h6>
                        {isLowStock && (
                          <span className="badge bg-danger">Low Stock</span>
                        )}
                      </div>
                      <p
                        className="mb-1 text-muted"
                        style={{ fontSize: "14px" }}
                      >
                        {product.description}
                      </p>
                      <p className="mb-1">
                        <strong>{formatPrice(product.price)}</strong> &middot;{" "}
                        Qty: {product.quantity ?? 0} &middot; Shipping:{" "}
                        {product.shipping ? "Yes" : "No"}
                      </p>
                      <p
                        className="mb-1 text-muted"
                        style={{ fontSize: "13px" }}
                      >
                        Category: {product.category?.name || "Unknown"}
                      </p>
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
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted">No products found</p>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
