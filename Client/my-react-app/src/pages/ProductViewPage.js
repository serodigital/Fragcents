import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner, Image, Card } from 'react-bootstrap';

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
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) throw new Error('Invalid product ID format');

        // Fetch main product
        const response = await axios.get(`http://localhost:8000/api/products/${id}`);
        const prod = response.data.product || response.data;
        if (!prod) throw new Error('Product not found in response');
        setProduct(prod);

        // Fetch all products for sorting
        const allProductsRes = await axios.get(`http://localhost:8000/api/products`);
        const allProducts = allProductsRes.data.products || allProductsRes.data || [];

        // Get newest arrivals (latest 4 products)
        const sortedByDate = [...allProducts].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNewArrivals(sortedByDate.slice(0, 4));

        // Get best sellers (top 4 products sorted by sold count)
        const sortedBySold = [...allProducts]
          .filter(p => p.sold > 0) // Only include products that have been sold
          .sort((a, b) => (b.sold || 0) - (a.sold || 0));
        setBestSellers(sortedBySold.slice(0, 4));

      } catch (err) {
        console.error(err);
        setError(err.response?.status === 404 ? "Product not found" : "Failed to load product.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Loading product details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center">
        <h2 className="text-danger">{error}</h2>
        <Button variant="primary" onClick={() => window.history.back()}>Go Back</Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="mt-5 text-center">
        <h2>No product data available</h2>
      </Container>
    );
  }

  const ProductMiniCard = ({ item, title }) => (
    <Card 
      className="mb-3 shadow-sm border-0"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/product-view/${item._id}`)}
    >
      <Row className="g-0 align-items-center">
        <Col xs={4}>
          <Image
            src={item._id 
              ? `http://localhost:8000/api/product/image/${item._id}`
              : "https://via.placeholder.com/100"}
            onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
            alt={item.name}
            fluid
            rounded
            style={{ height: '60px', objectFit: 'cover' }}
          />
        </Col>
        <Col xs={8}>
          <Card.Body className="p-2">
            <Card.Title className="small mb-1" style={{ fontSize: '0.85rem' }}>
              {item.name}
            </Card.Title>
            <Card.Text className="text-success fw-bold mb-0" style={{ fontSize: '0.8rem' }}>
              R{item.price?.toFixed(2)}
            </Card.Text>
            {title === 'Best Sellers' && item.sold > 0 && (
              <Card.Text className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>
                {item.sold} sold
              </Card.Text>
            )}
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );

  return (
    <Container className="mt-5">
      <Row>
        {/* Main Product Section (Left) */}
        <Col md={6}>
          <div className="text-center mb-4">
            <Image
              src={product._id 
                ? `http://localhost:8000/api/product/image/${product._id}`
                : "https://via.placeholder.com/400"}
              onError={(e) => (e.target.src = "https://via.placeholder.com/400")}
              alt={product.name}
              fluid
              rounded
              className="shadow"
              style={{ maxHeight: '450px', objectFit: 'contain' }}
            />
          </div>

          {/* Product Info */}
          <div className="p-4 bg-light rounded shadow-sm text-center">
            <h2 className="fw-bold">{product.name}</h2>
            <p className="text-muted">{product.description}</p>
            <h4 className="text-success fw-bold mb-3">R{product.price?.toFixed(2)}</h4>

            {product.AvailableInBulk && (
              <p className="text-info">
                <i className="fas fa-box"></i> Available in bulk
              </p>
            )}

            <Button
              variant="success"
              size="lg"
              onClick={() => addToCart(product)}
              disabled={!auth?.token}
              className="mt-2"
            >
              🛒 Add to Cart
            </Button>

            {!auth?.token && (
              <p className="text-danger mt-2">
                Please login to add items to your cart.
              </p>
            )}
          </div>
        </Col>

        {/* Right column: New Arrivals and Best Sellers */}
        <Col md={6}>
          <Row>
            {/* New Arrivals Column */}
            <Col md={6}>
              <h5 className="mb-4 fw-bold text-primary border-bottom pb-2">🆕 New Arrivals</h5>
              {newArrivals.length > 0 ? (
                newArrivals.map((item) => (
                  <ProductMiniCard key={item._id} item={item} title="New Arrivals" />
                ))
              ) : (
                <p className="text-muted">No new arrivals found.</p>
              )}
            </Col>

            {/* Best Sellers Column */}
            <Col md={6}>
              <h5 className="mb-4 fw-bold text-warning border-bottom pb-2">🏆 Best Sellers</h5>
              {bestSellers.length > 0 ? (
                bestSellers.map((item) => (
                  <ProductMiniCard key={item._id} item={item} title="Best Sellers" />
                ))
              ) : (
                <p className="text-muted">No best sellers found.</p>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductViewPage;


