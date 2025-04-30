import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors"; // Import CORS
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";

import productRoutes from "./routes/product.js";


dotenv.config();

const app = express();

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI || 'mongodb+srv://db:7Yhnd81U5jIlI1Tg@fragcents.isrmk.mongodb.net/?' || 'mongodb+srv://db:7Yhnd81U5jIlI1Tg@fragcents.isrmk.mongodb.net/?retryWrites=true&w=majority',
     { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB error =>", err));

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors()); // Enable CORS for all origins

// Router middleware
app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api/",productRoutes);


const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Node server is running on ${port}`);
});