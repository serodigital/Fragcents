import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import HomePage from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ShoppingPage from './pages/ShoppingPage';
import OrdersPage from './pages/OrdersPage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage'; // ✅ New import
import ProductViewPage from './pages/ProductViewPage'; // <-- Import your product view page
import { AuthProvider, useAuth } from './Context/Auth';

// Private route wrapper
const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();
  if (!auth?.token || !auth?.user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  // Cart state
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  // Remove item by product id
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  return (
    <AuthProvider>
      <Router>
        <Navbar cart={cart} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/shopping"
            element={
              <PrivateRoute>
                <ShoppingPage
                  cart={cart}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                />
              </PrivateRoute>
            }
          />

          <Route
            path="/product/:id"
            element={
              <PrivateRoute>
                <ProductViewPage
                  cart={cart}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                />
              </PrivateRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />

          {/* New Route for Purchase History */}
          <Route
            path="/purchase-history"
            element={
              <PrivateRoute>
                <PurchaseHistoryPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;


