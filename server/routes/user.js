import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/auth.js";
import { updateUserRole } from "../controllers/user.js";

const router = express.Router();

// Admin only: change a user's role
router.put("/user/:id/role", requireSignIn, isAdmin, updateUserRole);

export default router;
