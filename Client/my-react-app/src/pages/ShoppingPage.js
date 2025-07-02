import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ShoppingPage.css";

const ShoppingPage = ({ user, auth, onBack, cart, setCart }) => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);

  const products = [
    { id: 1, name: "Dunhil- Men", category: "SHOES", gender: "MALE", price: 100.0, image: "/images/3.JPG", description: "Classic men's shoes." },
    { id: 2, name: "Dunhil - Women", category: "DRESS", gender: "FEMALE", price: 100.0, image: "/images/4.JPG", description: "Elegant women's dress." },
    { id: 3, name: "Classic", category: "SHOES", gender: "MALE", price: 99.99, image: "/images/5.JPG", description: "Classic style shoes." },
    { id: 4, name: "Elegant Dress Pants", category: "PANTS", gender: "FEMALE", price: 129.99, image: "https://via.placeholder.com/300", description: "Comfortable dress pants." },
    { id: 5, name: "Running Shoes", category: "SHOES", gender: "FEMALE", price: 159.99, image: "https://via.placeholder.com/300", description: "Lightweight running shoes." },
    { id: 6, name: "Casual Jeans", category: "PANTS", gender: "MALE", price: 89.99, image: "https://via.placeholder.com/300", description: "Stylish casual jeans." }
  ];

  const handleAddToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
    alert(`${product.name} has been added to your cart!`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory || product.gender === selectedCategory;
    const matchesPrice =
      !selectedPriceRange ||
      (selectedPriceRange === "R0-R79" && product.price <= 79) ||
      (selectedPriceRange === "R80-R119" && product.price >= 80 && product.price <= 119) ||
      (selectedPriceRange === "R120-R179" && product.price >= 120 && product.price <= 179) ||
      (selectedPriceRange === "R180-R220" && product.price >= 180 && product.price <= 220);
    return matchesCategory && matchesPrice;
  });

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceRange(null);
  };

  return (
    <div className="shopping-page">
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <button className="btn btn-outline-secondary" onClick={onBack}>
            ⬅ Back to Dashboard
          </button>
          <button
            className="btn btn-outline-success"
            onClick={() => navigate("/purchase-history")}
          >
            🧾 Purchase History
          </button>
        </div>
      </nav>

      <div className="row">
        {/* Sidebar Filters */}
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-header">Filter by Category</div>
            <div className="card-body d-flex flex-column">
              {["FEMALE", "MALE", "PANTS", "SHOES", "DRESS"].map((category) => (
                <button
                  key={category}
                  className={`btn btn-outline-primary mb-2 ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">Filter by Price</div>
            <div className="card-body d-flex flex-column">
              {["ANY", "R0-R79", "R80-R119", "R120-R179", "R180-R220"].map((priceRange) => (
                <button
                  key={priceRange}
                  className={`btn btn-outline-secondary mb-2 ${selectedPriceRange === priceRange ? "active" : ""}`}
                  onClick={() => setSelectedPriceRange(priceRange === "ANY" ? null : priceRange)}
                >
                  {priceRange}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-danger mt-3 w-100" onClick={resetFilters}>
            RESET FILTERS
          </button>
        </div>

        {/* Product Grid */}
        <div className="col-md-9">
          <div className="text-center mb-4">
            <h2>{user?.name || auth?.user?.name || "Welcome to Fine Fragrances"}</h2>
            <p className="text-muted">Explore our products</p>
          </div>

          <div className="product-list d-flex flex-wrap justify-content-start">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-item card m-2 p-2" style={{ width: "18rem" }}>
                  <img src={product.image} className="card-img-top" alt={product.name} />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">R{product.price.toFixed(2)}</p>
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-primary" onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </button>
                      <button
                        className="btn btn-outline-info"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <h4>No products match your filters.</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;






