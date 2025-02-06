import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import HomePage from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./Context/Auth";

const App = () => {
    // Private Route Component
const PrivateRoute = ({ children }) => {
    const { auth } = useAuth();
    return auth.token ? children : <Navigate to="/register" />;
  };

    return (
        <Router>
            <Navbar />
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
            </Routes>
        </Router>
    );
};

export default App;
