import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js"; // Import the user routes you defined above

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB connected"))
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });

// Use the routes from the user router
app.use("/api", userRoutes);  // This will ensure your /register and /login routes are available under /api

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
