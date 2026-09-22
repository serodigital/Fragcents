import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../Context/Auth";

const CreateProduct = () => {
  const { auth } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    shipping: false,
    photo: null,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/categories");
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: data.categories[0]._id,
          }));
        }
      }
    } catch (error) {
      toast.error("Error fetching categories.");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, photo: e.target.files[0] });
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error("Please select a category before creating a product.");
      return;
    }

    try {
      const token = auth?.token
        ? auth.token.startsWith("Bearer ")
          ? auth.token
          : `Bearer ${auth.token}`
        : "";
      const productFormData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "photo" && formData.photo) {
          productFormData.append("photo", formData.photo);
        } else if (key === "shipping") {
          productFormData.append("shipping", String(formData.shipping));
        } else if (
          formData[key] !== null &&
          formData[key] !== undefined &&
          formData[key] !== ""
        ) {
          productFormData.append(key, formData[key]);
        }
      });

      const { data } = await axios.post(
        "http://localhost:8000/api/product",
        productFormData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Product created successfully");
        setFormData({
          name: "",
          description: "",
          price: "",
          category: categories.length > 0 ? categories[0]._id : "",
          quantity: "",
          shipping: false,
          photo: null,
        });
        setSelectedImage(null);
      }
    } catch (error) {
      toast.error("Error creating product.");
    }
  };

  return (
    <div className="card">
      <Toaster position="top-right" />
      <div className="card-header bg-primary text-white">Create Products</div>
      <div className="card-body">
        <form onSubmit={handleCreate}>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              name="photo"
              onChange={handleChange}
              accept="image/*"
            />
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Preview"
                style={{ height: "100px" }}
                className="img-thumbnail mt-2"
              />
            )}
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="name"
              placeholder="Write a name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <textarea
              className="form-control"
              name="description"
              placeholder="Write a description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <input
              type="number"
              className="form-control"
              name="price"
              placeholder="Enter Price"
              value={formData.price}
              onChange={handleChange}
              min="2"
              required
            />
          </div>

          <div className="mb-3">
            <select
              className="form-select"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Choose Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
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
              Choose Shipping (Required)
            </label>
          </div>

          <div className="mb-3">
            <input
              type="number"
              className="form-control"
              name="quantity"
              placeholder="Enter Quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
