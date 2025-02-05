import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";

dotenv.config();

const app = express();

// Get the correct __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb+srv://db:7Yhnd81U5jIlI1Tg@fragcents.isrmk.mongodb.net/?")
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB error => ", err));

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Serve static files from the React frontend build folder
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/", authRoutes);
app.use("/api/", categoryRoutes);
app.use("/api/", productRoutes);

// Serve frontend for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const port = process.env.PORT || 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Node server is running on ${port}`);
});
