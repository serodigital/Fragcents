import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/auth.js";
import {
  getAllUsers,
  getUserPassword,
  updateUser,
  updateUserRole,
  deleteUser,
} from "../controllers/user.js";

const router = express.Router();

router.get("/user", requireSignIn, isAdmin, getAllUsers);
router.get("/user/:id/password", requireSignIn, isAdmin, getUserPassword);
router.put("/user/:id", requireSignIn, updateUser);
router.put("/user/:id/role", requireSignIn, isAdmin, updateUserRole);
router.delete("/user/:id", requireSignIn, isAdmin, deleteUser);

export default router;
