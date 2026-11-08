import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "../components/cards/ProductCard";
import { useAuth } from "../Context/Auth";

const BACKEND_URL = process.env.REACT_APP_API_URL || "";

export default function HomePage() {
  const { auth } = useAuth();
  const isLoggedIn = Boolean(auth?.token);

  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [featuredError, setFeaturedError] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/products?limit=9`);
      if (data.products) setProducts(data.products);
    } catch {
      setProductsError(true);
    }
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/api/products?featured=true`,
      );
      if (data.products) setFeaturedProducts(data.products);
    } catch {
      setFeaturedError(true);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchFeaturedProducts()]);
      setLoading(false);
    };
    loadData();
  }, [fetchProducts, fetchFeaturedProducts]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border"
          style={{ color: "#957a4a" }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <style>{`
        .home-page {
          --gold: #957a4a;
          --gold-dark: #7d6639;
          --ink: #1c1612;
          --cream: #f7f1e8;
          --line: #e6dccb;
        }

        /* ---------- Hero ---------- */
        .home-page .home-hero {
          background:
            linear-gradient(160deg, rgba(28,22,18,0.88), rgba(28,22,18,0.7)),
            url(/images/banner.jpg) center / cover no-repeat,
            var(--ink);
          color: var(--cream);
          min-height: 460px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 16px;
        }
        .home-page .home-eyebrow {
          letter-spacing: 4px;
          text-transform: uppercase;
          font-size: 0.8rem;
          color: #cdb88a;
          margin-bottom: 16px;
        }
        .home-page .home-hero h1 {
          font-family: "Playfair Display", serif;
          font-size: clamp(2.2rem, 6vw, 4rem);
          margin-bottom: 16px;
        }
        .home-page .home-hero p {
          font-size: 1.15rem;
          color: #e6dccb;
          max-width: 520px;
          margin: 0 auto 28px;
        }

        /* ---------- Buttons ---------- */
        .home-page .btn-gold {
          background: var(--gold);
          border: none;
          color: #fff;
          padding: 14px 40px;
          border-radius: 8px;
          letter-spacing: 1px;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .home-page .btn-gold:hover {
          background: var(--gold-dark);
          color: #fff;
          transform: translateY(-2px);
        }
        .home-page .btn-gold-light {
          background: #fff;
          color: var(--ink);
          border: none;
          padding: 12px 36px;
          border-radius: 8px;
        }
        .home-page .btn-gold-light:hover { background: var(--cream); color: var(--ink); }

        /* ---------- Section headings ---------- */
        .home-page .home-section { padding: 64px 0; }
        .home-page .home-section.alt { background: var(--cream); }
        .home-page .section-title {
          font-family: "Playfair Display", serif;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--ink);
          margin-bottom: 8px;
        }
        .home-page .section-rule {
          width: 70px;
          height: 3px;
          background: var(--gold);
          margin: 0 auto 40px;
          border-radius: 2px;
        }

        /* ---------- Recolour the existing product cards ---------- */
        .home-page .card {
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .home-page .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 26px rgba(0,0,0,0.12);
        }
        .home-page .card .btn-primary {
          background: var(--gold);
          border-color: var(--gold);
          color: #fff;
        }
        .home-page .card .btn-primary:hover {
          background: var(--gold-dark);
          border-color: var(--gold-dark);
        }
        .home-page .card .btn-outline-primary {
          color: var(--gold-dark);
          border-color: var(--gold);
        }
        .home-page .card .btn-outline-primary:hover {
          background: var(--gold);
          border-color: var(--gold);
          color: #fff;
        }
        .home-page .card .text-success { color: var(--gold-dark) !important; }

        /* ---------- Why shop with us ---------- */
        .home-page .why-item { text-align: center; padding: 8px 16px; }
        .home-page .why-item .why-mark {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: var(--cream);
          border: 1px solid var(--line);
          color: var(--gold-dark);
          font-family: "Playfair Display", serif;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        }
        .home-page .why-item h6 {
          font-family: "Playfair Display", serif;
          margin-bottom: 6px;
        }
        .home-page .why-item p { color: #7a6a55; margin: 0; font-size: 0.95rem; }

        /* ---------- Join banner ---------- */
        .home-page .home-join {
          background: var(--ink);
          color: var(--cream);
          text-align: center;
          padding: 64px 16px;
        }
        .home-page .home-join h2 {
          font-family: "Playfair Display", serif;
          margin-bottom: 12px;
        }

        /* ---------- Footer ---------- */
        .home-page .home-footer {
          background: #120e0b;
          color: #cbbfa9;
          padding: 36px 0 24px;
        }
        .home-page .home-footer a {
          color: #cbbfa9;
          text-decoration: none;
          margin: 0 12px;
        }
        
        /* ---------- Tighter spacing ---------- */
        .home-page .home-section { padding: 40px 0; }
        .home-page .section-rule { margin-bottom: 28px; }
        .home-page .home-hero { min-height: 380px; padding: 40px 16px; }
        .home-page .home-join { padding: 44px 16px; }

        /* ---------- Smaller product cards ---------- */
        .home-page .home-section .row > [class*="col-"] .card {
          max-width: 260px;
          margin-left: auto;
          margin-right: auto;
          font-size: 0.9rem;
        }
        .home-page .card img { max-height: 170px; object-fit: cover; }
        .home-page .card .card-body { padding: 12px; }
        .home-page .card .btn {
          padding: 5px 10px !important;
          font-size: 0.82rem !important;
          margin-bottom: 4px !important;
        }
      `}</style>

      {/* Hero */}
      <header className="home-hero">
        <div className="container">
          <div className="home-eyebrow">Fine Fragrances</div>
          <h1>Discover a scent that is truly yours</h1>
          <p>Carefully chosen perfumes for every mood, moment and memory.</p>
          <Link to="/shop" className="btn btn-gold btn-lg">
            Shop Now
          </Link>
        </div>
      </header>

      {/* New Arrivals */}
      <section className="home-section">
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
          <div className="section-rule" />

          {productsError ? (
            <p className="text-center text-muted">
              We couldn't load our products right now. Please refresh in a
              moment.
            </p>
          ) : (
            <div className="row">
              {products.length ? (
                products.slice(0, 3).map((p) => (
                  <div key={p._id} className="col-md-4 col-sm-6 mb-4">
                    <ProductCard p={p} />
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">
                  New fragrances are on their way.
                </p>
              )}
            </div>
          )}

          <div className="text-center mt-2">
            <Link to="/shop" className="btn btn-outline-dark px-4">
              View all fragrances
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      {(featuredProducts.length > 0 || featuredError) && (
        <section className="home-section alt">
          <div className="container">
            <h2 className="section-title">Featured Fragrances</h2>
            <div className="section-rule" />

            {featuredError ? (
              <p className="text-center text-muted">
                We couldn't load featured fragrances right now.
              </p>
            ) : (
              <div className="row">
                {featuredProducts.slice(0, 4).map((p) => (
                  <div key={p._id} className="col-md-3 col-sm-6 mb-4">
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why shop with us */}
      <section className="home-section">
        <div className="container">
          <h2 className="section-title">Why FragCents</h2>
          <div className="section-rule" />
          <div className="row g-4">
            <div className="col-md-4">
              <div className="why-item">
                <div className="why-mark">✦</div>
                <h6>Genuine Fragrances</h6>
                <p>
                  Every bottle is chosen with care, so you shop with confidence.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="why-item">
                <div className="why-mark">✦</div>
                <h6>Secure Checkout</h6>
                <p>
                  Pay safely with PayFast using card, instant EFT or Capitec
                  Pay.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="why-item">
                <div className="why-mark">✦</div>
                <h6>Delivered To You</h6>
                <p>Order from home and we bring it to your door.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join banner: only for visitors */}
      {!isLoggedIn && (
        <section className="home-join">
          <div className="container">
            <h2>Ready to find your signature scent?</h2>
            <p className="mb-4">
              Create an account to save favourites and check out faster.
            </p>
            <Link to="/register" className="btn btn-gold-light btn-lg">
              Join FragCents
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="home-footer text-center">
        <div className="container">
          <div className="brand mb-2">FragCents</div>
          <div className="mb-3">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/cart">Cart</Link>
            {isLoggedIn ? (
              <Link to="/dashboard">My Account</Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
          <small>
            &copy; {new Date().getFullYear()} FragCents. All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  );
}
