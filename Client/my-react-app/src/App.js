import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Buffer } from "buffer";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./routes/AdminRoute";
import Navbar from "./components/Navbar";
import { useAuth } from "./Context/Auth";
import { useCart } from "./Context/CartContext";
import AdminCategories from "./pages/AdminCategories";
import AdminProducts from "./pages/AdminProducts";
import ShoppingPage from "./pages/ShoppingPage";
import ProductViewPage from "./pages/ProductViewPage";
import Checkout from "./pages/Checkout";
import SecureCheckout from "./pages/SecureCheckout";
import UserDatabaseTest from "./pages/UserDatabaseTest";
import OrderPage from "./pages/Orders";
import RegistrationSuccess from "./pages/RegistrationSuccess";

window.Buffer = Buffer;

const App = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/user-database-test" element={<UserDatabaseTest />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/SecureCheckout" element={<SecureCheckout />} />
        <Route path="/orders" element={<OrderPage />} />

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
