import User from "../models/user.js";
import { hashPassword, comparePassword } from "../helpers/auth.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";

const SECRET_KEY = process.env.JWT_SECRET || "aJh9dLpEqF8nResBVUCjNwAywLGz4D79dm8ReqTYaVZKRqWtPhVpKmTwd9D8BMCHEGjdJuRHph8tskPfm64xvNezH3cWd2nLXKeqkS98auBMvF";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) return res.json({ error: "Name is required" });
    if (!email) return res.json({ error: "Email is required" });
    if (!password || password.length < 6)
      return res.json({ error: "Password must be at least 6 characters long" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ error: "Email is already taken" });

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ name, email, password: hashedPassword });

    await sendEmail(
      email,
      "Welcome to FragCents 🎉",
      `Hi ${name}, welcome to FragCents! Your account has been created successfully.`
    );

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

    const user = await User.findOne({ email });
    if (!user) return res.json({ error: "Invalid email or password" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.json({ error: "Invalid email or password" });

    const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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

// =======================
// Forgot Password - request reset link
// =======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${rawToken}`;

    await sendEmail(
      email,
      "Reset your FragCents password",
      `Hi ${user.name}, click the link below to reset your password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`
    );

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// =======================
// Reset Password - set new password using token
// =======================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token) return res.json({ error: "Reset token is required" });
    if (!password || password.length < 6)
      return res.json({ error: "Password must be at least 6 characters long" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ error: "Reset link is invalid or has expired" });
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};