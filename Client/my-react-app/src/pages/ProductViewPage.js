import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const products = [
  { id: 1, name: "Dunhil- Men", category: "SHOES", gender: "MALE", price: 100.0, image: "/images/3.JPG", description: "Classic men's shoes that offer both comfort and style for everyday wear." },
  { id: 2, name: "Dunhil - Women", category: "DRESS", gender: "FEMALE", price: 100.0, image: "/images/4.JPG", description: "Elegant women's dress perfect for formal occasions and celebrations." },
  { id: 3, name: "Classic", category: "SHOES", gender: "MALE", price: 99.99, image: "/images/5.JPG", description: "Classic style shoes made with premium leather for durability." },
  { id: 4, name: "Elegant Dress Pants", category: "PANTS", gender: "FEMALE", price: 129.99, image: "https://via.placeholder.com/300", description: "Comfortable and stylish dress pants designed for professional wear." },
  { id: 5, name: "Running Shoes", category: "SHOES", gender: "FEMALE", price: 159.99, image: "https://via.placeholder.com/300", description: "Lightweight running shoes engineered for maximum performance." },
  { id: 6, name: "Casual Jeans", category: "PANTS", gender: "MALE", price: 89.99, image: "https://via.placeholder.com/300", description: "Stylish casual jeans suitable for all-day wear." }
];

const ProductViewPage = ({ cart, addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === parseInt(id));
  if (!product) return <p>Product not found.</p>;

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "1rem", minHeight: "80vh" }}>
      
      {/* Left: Back button only */}
      <div style={{ width: "80px", position: "relative" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            padding: "0.5rem 1rem",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
      </div>

      {/* Middle: Main Product centered */}
      <div style={{ flex: 4, display: "flex", justifyContent: "center", alignItems: "flex-start", flexDirection: "column" }}>
        <div style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
          />
          <h2>{product.name}</h2>
          <p style={{ fontStyle: "italic", color: "#555" }}>
            {product.description}
          </p>
          <p><strong>Price:</strong> R{product.price.toFixed(2)}</p>
          <p><strong>Gender:</strong> {product.gender}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <button className="btn btn-primary" onClick={() => handleAddToCart(product)}>
            Add to Cart
          </button>
        </div>
      </div>

      {/* Right: Related Products */}
      <aside style={{ flex: 2, borderLeft: "1px solid #ccc", paddingLeft: "1rem" }}>
        <h3>Related Products</h3>
        {relatedProducts.length === 0 && <p>No related products.</p>}
        {relatedProducts.map((rp) => (
          <div key={rp.id} style={{ marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>
            <img src={rp.image} alt={rp.name} style={{ width: "100%", height: "auto" }} />
            <h5>{rp.name}</h5>
            <p>Price: R{rp.price.toFixed(2)}</p>
            <p>Gender: {rp.gender}</p>
            <p>Category: {rp.category}</p>
            <button className="btn btn-sm btn-success" onClick={() => handleAddToCart(rp)}>Add to Cart</button>
          </div>
        ))}
      </aside>
    </div>
  );
};

export default ProductViewPage;

