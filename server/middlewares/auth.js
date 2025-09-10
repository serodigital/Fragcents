import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Move this to environment variables for security
const JWT_SECRET = process.env.JWT_SECRET || 'aJh9dLpEqF8nResBVUCjNwAywLGz4D79dm8ReqTYaVZKRqWtPhVpKmTwd9D8BMCHEGjdJuRHph8tskPfm64xvNezH3cWd2nLXKeqkS98auBMvF';

export const requireSignIn = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        
        if (!token) {
            return res.status(401).json({ error: "Authorization token required" });
        }
        
        // If token includes "Bearer ", remove it
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        
        const decoded = jwt.verify(cleanToken, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT verification error:", err.message);
        return res.status(401).json({ 
            error: "Invalid or expired token",
            details: err.message 
        });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        if (user.role !== 1) {
            return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
        
        next();
    } catch (err) {
        console.error("Admin check error:", err);
        return res.status(500).json({ 
            error: "Internal server error during admin verification",
            details: err.message 
        });
    }
};