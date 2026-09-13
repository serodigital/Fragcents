import express from "express";
import { requireSignIn, isAdmin, isManager } from "../middlewares/auth.js";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getFinanceSummary,
  updateOrderStatus,
} from "../controllers/order.js";

const router = express.Router();

router.post("/order", requireSignIn, createOrder);
router.get("/order/mine", requireSignIn, getMyOrders);
router.get("/orders", requireSignIn, isAdmin, getAllOrders);
router.get("/finance-summary", requireSignIn, isManager, getFinanceSummary);
router.put("/order/:id/status", requireSignIn, isAdmin, updateOrderStatus);

export default router;
