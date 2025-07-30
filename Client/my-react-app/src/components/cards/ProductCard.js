import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from "../../Context/CartContext";
import moment from "moment";

// Currency formatter (Dollar to Rand)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
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
  
  return (
    <div className="card mb-3" style={{ maxWidth: '280px', margin: '0 auto' }}>
      {/* Image Section */}
      <div className="image-container" style={{ height: '180px', position: 'relative' }}>
        {imageLoading && !imageError && (
          <div
            className="d-flex align-items-center justify-content-center h-100 bg-light"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
       
        {!imageError ? (
          <img
            src={`http://localhost:8000/api/product/image/${p._id}`}
            alt={p.name}
            className="card-img-top"
            style={{
              height: '180px',
              objectFit: 'cover',
              width: '100%',
              display: imageLoading ? 'none' : 'block'
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div
            className="d-flex align-items-center justify-content-center h-100 bg-light text-muted"
            style={{ height: '180px' }}
          >
            <span className="text-muted small">No image</span>
          </div>
        )}
      </div>
      
      <div className="card-body p-3">
        <h6 className="card-title mb-2" style={{
          fontSize: '0.9rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>{p.name}</h6>
       
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">{moment(p.createdAt).fromNow()}</small>
          <small className="fw-bold text-secondary">{p.sold} sold</small>
        </div>
       
        <p className="text-success fw-bold mb-3" style={{ fontSize: '1rem' }}>
          {formatCurrency(p.price)}
        </p>
       
        {/* Button Group */}
        <div className="d-grid gap-2">
          {/* ✅ Link now navigates using ID */}
          <Link 
  to={`/product-view/${p._id}`}  
  className="btn btn-outline-primary btn-sm"
  style={{ fontSize: '0.85rem' }}
>
  👁️ View Details
</Link>
          
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              addToCart({
                id: p._id,
                name: p.name,
                price: formatCurrency(p.price),
                image: `http://localhost:8000/api/product/image/${p._id}`
              });
              alert(`${p.name} added to cart`);
            }}
            style={{ fontSize: '0.85rem' }}
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
