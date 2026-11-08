import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../Context/CartContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);

const readSavedItems = () => {
  try {
    return JSON.parse(localStorage.getItem("savedItems") || "[]");
  } catch {
    return [];
  }
};

const HeartIcon = ({ filled }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? "#957a4a" : "none"}
    stroke="#957a4a"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

export default function ProductCard({ p }) {
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(() =>
    readSavedItems().some((item) => item.id === p._id),
  );
  const { addToCart } = useCart();

  const imageUrl = `${API_URL}/api/product/image/${p._id}`;
  const soldOut = Number(p.quantity) === 0;

  // Save / unsave (the heart)
  const handleToggleSave = () => {
    const existing = readSavedItems();
    const alreadySaved = existing.some((item) => item.id === p._id);

    if (alreadySaved) {
      const updated = existing.filter((item) => item.id !== p._id);
      localStorage.setItem("savedItems", JSON.stringify(updated));
      setIsSaved(false);
      toast.success(`"${p.name}" removed from saved items`);
      return;
    }

    const savedItem = {
      id: p._id,
      cartItemId: `saved_${p._id}_${Date.now()}`,
      name: p.name,
      price: formatCurrency(p.price),
      image: imageUrl,
      category: p.category || "Uncategorized",
      dateAdded: new Date().toISOString(),
      originalPrice: p.price,
    };

    localStorage.setItem(
      "savedItems",
      JSON.stringify([...existing, savedItem]),
    );
    setIsSaved(true);
    toast.success(`"${p.name}" saved`);
  };

  const handleAddToCart = () => {
    if (soldOut) {
      toast.error(`${p.name} is sold out`);
      return;
    }

    addToCart({
      _id: p._id,
      name: p.name,
      price: p.price,
      image: imageUrl,
      stock: p.quantity,
      category: p.category,
    });

    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="fc-card">
      <style>{`
        .fc-card {
          background: #fff;
          border: 1px solid #e6dccb;
          border-radius: 14px;
          overflow: hidden;
          max-width: 280px;
          margin: 0 auto;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .fc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.12);
        }
        .fc-card .fc-img-wrap {
          position: relative;
          height: 200px;
          background: #f1eadf;
          display: block;
        }
        .fc-card .fc-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }
        .fc-card .fc-noimg {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9a8b73;
          font-size: 0.85rem;
        }
        .fc-card .fc-heart {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        .fc-card .fc-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #1c1612;
          color: #fff;
          font-size: 0.72rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .fc-card .fc-body { padding: 12px 14px 14px; }
        .fc-card .fc-name {
          font-family: "Playfair Display", serif;
          font-size: 1rem;
          color: #1c1612;
          display: block;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fc-card .fc-name:hover { color: #7d6639; }
        .fc-card .fc-price {
          color: #7d6639;
          font-weight: 600;
          margin: 4px 0 10px;
        }
        .fc-card .fc-add {
          width: 100%;
          border: none;
          background: #957a4a;
          color: #fff;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.9rem;
        }
        .fc-card .fc-add:hover:not(:disabled) { background: #7d6639; }
        .fc-card .fc-add:disabled {
          background: #d9d2c5;
          color: #7a6a55;
          cursor: not-allowed;
        }
      `}</style>

      {/* Image: click to view details */}
      <div className="fc-img-wrap">
        <Link to={`/product-view/${p._id}`} style={{ display: "block" }}>
          {!imageError ? (
            <img
              src={imageUrl}
              alt={p.name}
              className="fc-img"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="fc-noimg">No image</div>
          )}
        </Link>

        {soldOut && <span className="fc-tag">Sold out</span>}

        <button
          type="button"
          className="fc-heart"
          onClick={handleToggleSave}
          title={isSaved ? "Remove from saved items" : "Save for later"}
          aria-label={isSaved ? "Remove from saved items" : "Save for later"}
        >
          <HeartIcon filled={isSaved} />
        </button>
      </div>

      {/* Details */}
      <div className="fc-body">
        <Link to={`/product-view/${p._id}`} className="fc-name" title={p.name}>
          {p.name}
        </Link>
        <div className="fc-price">{formatCurrency(p.price)}</div>

        <button
          type="button"
          className="fc-add"
          onClick={handleAddToCart}
          disabled={soldOut}
        >
          {soldOut ? "Sold out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
