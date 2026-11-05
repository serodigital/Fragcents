import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/auth.js";
import {
  register,
  login,
  secret,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/user.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Testing route
router.get("/secret", requireSignIn, isAdmin, secret);

// User routes
router.get("/user", requireSignIn, isAdmin, getAllUsers);
router.get("/user/:id", requireSignIn, getUser);
router.put("/user/:id", requireSignIn, updateUser);
router.delete("/user/:id", requireSignIn, isAdmin, deleteUser);

export default router;
