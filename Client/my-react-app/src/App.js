import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import HomePage from './pages/Home';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './Context/Auth';
import { CartProvider } from './Context/CartContext';  

const App = () => {
    // Private Route Component
    const PrivateRoute = ({ children }) => {
        const { auth } = useAuth();
        return auth.token ? children : <Navigate to="/register" />;
    };

    return (
        <CartProvider>  {/* Wrap everything in CartProvider */}
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/cart" element={<CartPage />} />  {/*  Cart Route */}
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
                    
                </Routes>
            </Router>
        </CartProvider>
    );
};

export default App;
