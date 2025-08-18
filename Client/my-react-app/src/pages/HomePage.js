import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProductCard from '../components/cards/ProductCard';

const BACKEND_URL = "http://localhost:8000";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch up to 9 products for New Arrivals (display only 3)
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/products?limit=9`);
      if (data.products) setProducts(data.products);
    } catch {
      setError("Failed to load products");
    }
  }, []);

  // Fetch featured products (backend may send more than 4, but we'll slice later)
  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/products?featured=true`);
      if (data.products) setFeaturedProducts(data.products);
    } catch {
      setError("Failed to load featured products");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchProducts(), fetchFeaturedProducts()]);
      } catch {
        setError("Failed to load homepage data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchProducts, fetchFeaturedProducts]);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return <div className="alert alert-danger text-center my-5">{error}</div>;

  return (
    <>
      {/* Bootstrap CSS CDN */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <header
        className="bg-dark text-white d-flex align-items-center justify-content-center text-center"
        style={{
          backgroundImage: 'url(/images/banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '450px',
          position: 'relative',
          zIndex: 0,
        }}
      >
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <h1 className="display-4 fw-bold mb-3 text-shadow">Welcome to Fregcent</h1>
          <p className="lead mb-4 text-shadow">
            Shop the latest trends. Discover unbeatable deals.
          </p>
          <a href="/shop" className="btn btn-success btn-lg px-5 py-3 shadow">
            Start Shopping
          </a>
        </div>
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 1 }}
        ></div>

        <style>{`
          .text-shadow {
            text-shadow: 0 2px 6px rgba(0,0,0,0.75);
          }
          .btn-success:hover {
            background-color: #28a745cc;
            box-shadow: 0 4px 12px rgba(40,167,69,.6);
          }
        `}</style>
      </header>

      {/* New Arrivals Section: Show 3 products only */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5 fw-semibold border-bottom border-3 border-success pb-3">
            New Arrivals
          </h2>
          <div className="row">
            {products.length ? (
              products.slice(0, 3).map((p) => (
                <div key={p._id} className="col-md-4 col-sm-6 mb-4">
                  <ProductCard p={p} />
                </div>
              ))
            ) : (
              <p className="text-muted text-center">No products available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section: Show exactly 4 products */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5 fw-semibold border-bottom border-3 border-success pb-3">
            Featured Products
          </h2>
          <div className="row">
            {featuredProducts.length ? (
              featuredProducts.slice(0, 4).map((p) => (
                <div key={p._id} className="col-md-3 col-sm-6 mb-4">
                  <ProductCard p={p} />
                </div>
              ))
            ) : (
              <p className="text-muted text-center">No featured products available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-success text-white text-center py-5">
        <div className="container">
          <h2 className="mb-3 fw-semibold">Ready to explore more?</h2>
          <p className="mb-4 fs-5">Create an account and start shopping now.</p>
          <a href="/register" className="btn btn-light btn-lg px-4 py-2 shadow">
            Join Fregcent
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4">
        <div className="container">
          <p className="mb-0">&copy; {new Date().getFullYear()} Fregcent. All rights reserved.</p>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        .hover-scale:hover {
          transform: translateY(-8px) scale(1.03);
          transition: all 0.3s ease-in-out;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
          cursor: pointer;
        }
        .card {
          transition: transform 0.3s ease;
          border-radius: 12px;
        }
        .btn-outline-success:hover {
          background-color: #198754;
          color: white;
          border-color: #198754;
          transition: background-color 0.3s ease;
        }
        section h2 {
          letter-spacing: 1px;
          text-transform: uppercase;
        }
      `}</style>
    </>
  );
}
