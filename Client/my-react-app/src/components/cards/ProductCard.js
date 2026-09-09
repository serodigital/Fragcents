import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from "../../Context/CartContext";
import moment from "moment";
import axios from "axios";
//import toast from 'react-hot-toast';
import toast, { Toaster } from "react-hot-toast";



// Currency formatter
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);
};

export default function ProductCard({ p }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart } = useCart();

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Save Item
  const handleSaveItem = async () => {
    try {
      // Save to backend
      await axios.post("http://localhost:8000/api/saved-items", {
        productId: p._id,
      });

      // Get existing saved items
      const existingSavedItems = JSON.parse(
        localStorage.getItem("savedItems") || "[]"
      );

      // Check if item is already saved
      const isAlreadySaved = existingSavedItems.some(
        (item) => item.id === p._id
      );

      if (isAlreadySaved) {
        toast.error("Item already saved!");
        return;
      }

      // Create saved item
      const savedItem = {
        id: p._id,
        cartItemId: `saved_${p._id}_${Date.now()}`,
        name: p.name,
        price: formatCurrency(p.price),
        image: `http://localhost:8000/api/product/image/${p._id}`,
        category: p.category || "Uncategorized",
        dateAdded: new Date().toISOString(),
        originalPrice: p.price,
      };

      // Add item to saved items
      const updatedSavedItems = [
        ...existingSavedItems,
        savedItem,
      ];

      localStorage.setItem(
        "savedItems",
        JSON.stringify(updatedSavedItems)
      );

      toast.success(`"${p.name}" saved successfully!`);
    } catch (err) {
      console.error("Error saving item:", err);

      // Fallback: save to localStorage if backend fails
      const existingSavedItems = JSON.parse(
        localStorage.getItem("savedItems") || "[]"
      );

      const isAlreadySaved = existingSavedItems.some(
        (item) => item.id === p._id
      );

      if (!isAlreadySaved) {
        const savedItem = {
          id: p._id,
          cartItemId: `saved_${p._id}_${Date.now()}`,
          name: p.name,
          price: formatCurrency(p.price),
          image: `http://localhost:8000/api/product/image/${p._id}`,
          category: p.category || "Uncategorized",
          dateAdded: new Date().toISOString(),
          originalPrice: p.price,
        };

        const updatedSavedItems = [
          ...existingSavedItems,
          savedItem,
        ];

        localStorage.setItem(
          "savedItems",
          JSON.stringify(updatedSavedItems)
        );

        toast.success(`"${p.name}" saved locally!`);
      } else {
        toast.error("Item already saved!");
      }
    }
  };

  

  return (
    <>
      {/* Toast notifications */}
      <Toaster position="top-right" />

      <div
        className="card mb-3"
        style={{
          maxWidth: "280px",
          margin: "0 auto",
        }}
      >
        {/* Image Section */}
        <div
          className="image-container"
          style={{
            height: "180px",
            position: "relative",
          }}
        >
          {/* Loading spinner */}
          {imageLoading && !imageError && (
            <div
              className="d-flex align-items-center justify-content-center h-100 bg-light"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>
            </div>
          )}

          {/* Product image */}
          {!imageError ? (
            <img
              src={`http://localhost:8000/api/product/image/${p._id}`}
              alt={p.name}
              className="card-img-top"
              style={{
                height: "180px",
                objectFit: "cover",
                width: "100%",
                display: imageLoading ? "none" : "block",
              }}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center h-100 bg-light text-muted"
              style={{
                height: "180px",
              }}
            >
              <span className="text-muted small">
                No image
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="card-body p-3">
          {/* Product name */}
          <h6
            className="card-title mb-2"
            style={{
              fontSize: "0.9rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p.name}
          </h6>

          {/* Date and sold */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">
              {moment(p.createdAt).fromNow()}
            </small>

            <small className="fw-bold text-secondary">
              {p.sold} sold
            </small>
          </div>

          {/* Price */}
          <p
            className="text-success fw-bold mb-3"
            style={{
              fontSize: "1rem",
            }}
          >
            {formatCurrency(p.price)}
          </p>

          {/* Button Group */}
          <div className="d-grid gap-2">
            {/* View Details */}
            <Link
              to={`/product-view/${p._id}`}
              className="btn btn-outline-primary btn-sm"
              style={{
                fontSize: "0.85rem",
              }}
            >
              👁️ View Details
            </Link>

            {/* Add To Cart */}
            {/* Add To Cart */}
<button
  className={`btn ${
    Number(p.quantity) === 0 ? "btn-secondary" : "btn-primary"
  } btn-sm`}
  onClick={() => {
    // Check database quantity before adding
    if (Number(p.quantity) === 0) {
      toast.error(`${p.name} is SOLD OUT!`);
      return;
    }

    addToCart({
      _id: p._id,
      name: p.name,
      price: p.price,
      image: `http://localhost:8000/api/product/image/${p._id}`,

      // Database stock
      stock: p.quantity,

      // Optional product information
      category: p.category,
    });

    toast.success(`${p.name} added to cart`);
  }}
  disabled={Number(p.quantity) === 0}
  style={{
    fontSize: "0.85rem",
  }}
>
  {Number(p.quantity) === 0
    ? " SOLD OUT"
    : "🛒 Add to Cart"}
</button>

            {/* Save Item */}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleSaveItem}
              style={{
                fontSize: "0.85rem",
              }}
            >
              💾 Save Item
            </button>
          </div>
        </div>
      </div>
    </>
  );
}