import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
            <Link to="/register">Register</Link>
        </nav>
    );
};

export default Navbar;
