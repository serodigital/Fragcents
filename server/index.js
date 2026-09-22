import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import nodemailer from "nodemailer"; // Email functionality
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";
import userRoutes from "./routes/user.js";
import orderRoutes from "./routes/order.js";
const app = express();

// ===============================
// 📌 MongoDB Connection
// ===============================
mongoose
  .connect(
    "mongodb+srv://db:7Yhnd81U5jIlI1Tg@fragcents.isrmk.mongodb.net/fragcents?retryWrites=true&w=majority",
  )
  .then(() => console.log("✅ DB connected"))
  .catch((err) => console.log("❌ DB error =>", err));

// ===============================
// 📌 Middleware
// ===============================
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// ===============================
// 📌 Email Transporter
// ===============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sphakhumalo610@gmail.com", // your Gmail
    pass: "hjsevrzeqooysjrh", // your Gmail App Password
  },
});

// ===============================
// 📌 Test Email Route
// ===============================
app.post("/api/test-email", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: "sphakhumalo610@gmail.com",
      to: "sphakhumalo610@gmail.com", // test yourself
      subject: "📧 Test Email - FragCents Backend",
      text: "If you see this, email is working ✅",
    });

    console.log("✅ Test email sent:", info.messageId);

    res.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("❌ Test email failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===============================
// 📌 Router Middleware
// ===============================
app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", userRoutes);
app.use("/api", orderRoutes);

// ===============================
// 📌 Server Start
// ===============================
const port = 8000;
app.listen(port, () => {
  console.log(`🚀 Node server is running on port ${port}`);
  console.log("📧 Email service configured for: sphakhumalo610@gmail.com");
  console.log("➡️ Test with POST /api/test-email");
});
