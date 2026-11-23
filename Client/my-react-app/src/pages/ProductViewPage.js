import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Button, Spinner, Image } from "react-bootstrap";

// Small grey placeholder (no external site needed)
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%' height='100%' fill='#efe8dc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#8a8378' font-family='sans-serif' font-size='18'>No image</text></svg>`,
  );

const formatPrice = (price) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(price) || 0);

const handleImgError = (e) => {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER;
};

const ProductMiniCard = ({ item, showSold, onClick }) => (
  <div className="sd-mini-card" onClick={onClick} role="button" tabIndex={0}>
    <img
      src={`/api/product/image/${item._id}`}
      onError={handleImgError}
      alt={item.name}
    />
    <div className="sd-mini-card-body">
      <div className="sd-mini-card-name">{item.name}</div>
      <div className="sd-mini-card-price">{formatPrice(item.price)}</div>
      {showSold && item.sold > 0 && (
        <div className="sd-mini-card-sold">{item.sold} sold</div>
      )}
    </div>
  </div>
);

const ProductViewPage = ({ user, auth, cart, addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product, new arrivals, and best sellers
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/))
          throw new Error("Invalid product ID format");

        // Fetch main product
        const response = await axios.get(`/api/products/${id}`);
        const prod = response.data.product || response.data;
        if (!prod) throw new Error("Product not found in response");
        setProduct(prod);

        // Fetch all products for sorting
        const allProductsRes = await axios.get(`/api/products`);
        const allProducts =
          allProductsRes.data.products || allProductsRes.data || [];

        // Newest arrivals (latest 4 products)
        const sortedByDate = [...allProducts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setNewArrivals(sortedByDate.slice(0, 4));

        // Best sellers (top 4 by sold count)
        const sortedBySold = [...allProducts]
          .filter((p) => p.sold > 0)
          .sort((a, b) => (b.sold || 0) - (a.sold || 0));
        setBestSellers(sortedBySold.slice(0, 4));
      } catch (err) {
        console.error(err);
        setError(
          err.response?.status === 404
            ? "Product not found"
            : "Failed to load product.",
        );
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-2 text-muted">Loading product details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <h1 className="h3 mb-3">{error}</h1>
        <Button variant="primary" onClick={() => window.history.back()}>
          Go back
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h1 className="h3">No product data available</h1>
      </Container>
    );
  }

  const outOfStock =
    product.quantity !== undefined && Number(product.quantity) <= 0;

  return (
    <Container className="py-4 mb-4">
      <Link to="/shop" className="sd-back-link">
        &larr; Back to shop
      </Link>

      {/* Main product */}
      <Row className="g-4 mt-1 align-items-start">
        <Col md={6}>
          <div className="sd-product-image">
            <Image
              src={`/api/product/image/${product._id}`}
              onError={handleImgError}
              alt={product.name}
              fluid
            />
          </div>
        </Col>

        <Col md={6}>
          <div className="sd-product-info">
            {product.category?.name && (
              <div className="sd-product-eyebrow">{product.category.name}</div>
            )}
            <h1 className="sd-product-title">{product.name}</h1>
            <div className="sd-product-price">{formatPrice(product.price)}</div>

            <p className="sd-product-desc">{product.description}</p>

            {product.AvailableInBulk && (
              <p className="small text-muted mb-3">Available in bulk</p>
            )}

            {outOfStock && (
              <p className="small fw-semibold" style={{ color: "#5c2a34" }}>
                Currently out of stock
              </p>
            )}

            <Button
              variant="warning"
              size="lg"
              className="w-100 mt-2"
              onClick={() => addToCart(product)}
              disabled={!auth?.token || outOfStock}
            >
              Add to Cart
            </Button>

            {!auth?.token && (
              <p className="small text-muted mt-3 mb-0">
                Please <Link to="/login">log in</Link> to add items to your
                cart.
              </p>
            )}
          </div>
        </Col>
      </Row>

      {/* More fragrances */}
      <Row className="g-4 mt-4">
        <Col md={6}>
          <h2 className="sd-side-title">New Arrivals</h2>
          {newArrivals.length > 0 ? (
            newArrivals.map((item) => (
              <ProductMiniCard
                key={item._id}
                item={item}
                onClick={() => navigate(`/product-view/${item._id}`)}
              />
            ))
          ) : (
            <p className="text-muted">No new arrivals found.</p>
          )}
        </Col>

        <Col md={6}>
          <h2 className="sd-side-title">Best Sellers</h2>
          {bestSellers.length > 0 ? (
            bestSellers.map((item) => (
              <ProductMiniCard
                key={item._id}
                item={item}
                showSold
                onClick={() => navigate(`/product-view/${item._id}`)}
              />
            ))
          ) : (
            <p className="text-muted">No best sellers found.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductViewPage;
