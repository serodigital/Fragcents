import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/user.js"; // Import the User model

dotenv.config();
const app = express();
mongoose
  .connect(process.env.MONGO_URI || 'mongodb+srv://db:7Yhnd81U5jIlI1Tg@fragcents.isrmk.mongodb.net/?retryWrites=true&w=majority', 
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB connected"))
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1); 
  });

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // Allow your frontend's URL
  methods: "GET,POST",
  credentials: true,  // If you need to send cookies or authentication data
}));

// JWT Secret key
const JWT_SECRET = 'your-secret-key';  // Make sure to keep this safe

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];  // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);  // Verify the token
    req.user = decoded;  // Add user info to the request object
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// POST: Register a new user
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,  // Store the hashed password
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, name: newUser.name }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: "User registered successfully.",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "An error occurred during registration. Please try again." });
  }
});

// POST: Login user
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login. Please try again." });
  }
});

// GET: Fetch current authenticated user's data (me route)
app.get("/api/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);  // Use the userId from the JWT token
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "An error occurred while fetching user data." });
  }
});

// Server listen
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Node server is running on ${port}`);
});
