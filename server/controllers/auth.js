import User from "../models/user.js";
import { hashPassword, comparePassword } from "../helpers/auth.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";

const SECRET_KEY =
  "aJh9dLpEqF8nResBVUCjNwAywLGz4D79dm8ReqTYaVZKRqWtPhVpKmTwd9D8BMCHEGjdJuRHph8tskPfm64xvNezH3cWd2nLXKeqkS98auBMvF";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) return res.json({ error: "Name is required" });
    if (!email) return res.json({ error: "Email is required" });
    if (!password || password.length < 6)
      return res.json({ error: "Password must be at least 6 characters long" });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ error: "Email is already taken" });
    
    // Hash password before saving
    const hashedPassword = await hashPassword(password);
    const user = await User.create({ name, email, password: hashedPassword });
    
    // Send welcome email (without password for security)
    await sendEmail(
      email,
      "Welcome to FragCents 🎉",
      `Hi ${name}, welcome to FragCents! Your account has been created successfully.`
    );
    
    // Create JWT token
    const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: "7d" });
    
    res.json({
      message: "Registration successful! Email sent.",
      user: { name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.json({ error: "Email is required" });
    if (!password) return res.json({ error: "Password is required" });
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.json({ error: "Invalid email or password" });
    
    // Compare password
    const match = await comparePassword(password, user.password);
    if (!match) return res.json({ error: "Invalid email or password" });
    
    // Create JWT token
    const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: "7d" });
    
    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const secret = async (req, res) => {
  try {
    res.json({
      message: "Access granted to protected route",
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Individual named exports (this is what your routes file expects)