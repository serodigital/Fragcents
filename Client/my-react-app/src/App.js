import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CartPage from './pages/CartPage';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./routes/AdminRoute";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from './Context/Auth';
import { CartProvider, useCart } from './Context/CartContext';  
import AdminCategories from "./pages/AdminCategories";
import AdminProducts from "./pages/AdminProducts";
import ShoppingPage from './pages/ShoppingPage';
import ProductViewPage from './pages/ProductViewPage';
import { Buffer } from 'buffer';

window.Buffer = Buffer;

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Shopping and Product Routes */}
        <Route path="/shop" element={<ShoppingPageWrapper />} />
        <Route path="/product-view/:id" element={<ProductViewPageWrapper />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
};

// Wrapper for Shopping Page
function ShoppingPageWrapper() {
  const { user, auth } = useAuth();
  const { cart, addToCart, purchaseHistory } = useCart();

  return (
    <ShoppingPage
      user={user}
      auth={auth}
      cart={cart}
      addToCart={addToCart}
      purchaseHistory={purchaseHistory}
      onBack={() => window.history.back()}
    />
  );
}

// Wrapper for ProductViewPage
function ProductViewPageWrapper() {
  const { user, auth } = useAuth();
  const { cart, addToCart } = useCart();

  return (
    <ProductViewPage
      user={user}
      auth={auth}
      cart={cart}
      addToCart={addToCart}
    />
  );
}

export default App;
