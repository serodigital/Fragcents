import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";
import cors from "cors";

dotenv.config();

const app = express();

// db 
mongoose
.connect(process.env.MONGO_URI || 'mongodb+srv://db:7Yhnd81U5jIlI1Tg@fragcents.isrmk.mongodb.net/?')
.then(() => console.log("DB connected"))
.catch(err => console.log('DB error => ', err));

//middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// router middleware
app.use("/api/",authRoutes);
app.use("/api/",categoryRoutes);
app.use("/api/",productRoutes);




const port = process.env.PORT || 8000;

app.listen(port, () =>{
    console.log(`Node server is running on ${port}`);
});
