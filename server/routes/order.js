import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { sendEmail } from "../utils/email.js";
import { requireSignIn, isAdmin, isManager } from "../middlewares/auth.js";
import {
  getMyOrders,
  getAllOrders,
  getFinanceSummary,
  updateOrderStatus,
} from "../controllers/order.js";

const router = express.Router();

// =====================================
// CREATE ORDER
// Supports logged-in users and guests.
// - Stock is reduced atomically
// - Stock is rolled back if anything fails
// - Confirmation email is sent after the order is saved
// =====================================

router.post("/create", async (req, res) => {
  const updatedProducts = [];

  try {
    const {
      orderNumber,
      user,
      customer,
      deliveryAddress,
      products,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentReference,
    } = req.body;

    // ---------- USER ----------
    let cleanUser = null;

    if (user) {
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({
          success: false,
          message: `Invalid user ID: ${user}`,
        });
      }
      cleanUser = user;
    }

    // ---------- CUSTOMER ----------
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: "Customer information is missing.",
      });
    }

    // ---------- ADDRESS ----------
    if (
      !deliveryAddress ||
      !deliveryAddress.address ||
      !deliveryAddress.city ||
      !deliveryAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery address information is missing.",
      });
    }

    // ---------- PRODUCTS ----------
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order products are missing.",
      });
    }

    const cleanedProducts = [];

    for (const item of products) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: `Product ID is missing for ${item.name || "an item"}.`,
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID for ${item.name || "an item"}: ${item.product}`,
        });
      }

      if (!item.name) {
        return res.status(400).json({
          success: false,
          message: "Product name is missing.",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${item.name}.`,
        });
      }

      const price = Number(item.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${item.name}.`,
        });
      }

      // Check the product exists and has stock
      const productExists = await Product.findById(item.product);

      if (!productExists) {
        return res.status(400).json({
          success: false,
          message: `Product does not exist in database: ${item.product}`,
        });
      }

      const availableQuantity = Number(productExists.quantity || 0);

      if (availableQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `${productExists.name} is sold out.`,
        });
      }

      if (quantity > availableQuantity) {
        return res.status(400).json({
          success: false,
          message:
            `Not enough stock for ${productExists.name}. ` +
            `Only ${availableQuantity} left.`,
        });
      }

      cleanedProducts.push({
        product: item.product,
        name: productExists.name.trim(),
        quantity,
        price,
      });
    }

    // ---------- PAYMENT METHOD ----------
    const allowedPaymentMethods = [
      "PayFast - Credit/Debit Card",
      "PayFast - Instant EFT",
      "PayFast - Capitec Pay",
    ];

    if (!paymentMethod || !allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing PayFast payment method.",
      });
    }

    // ---------- MONEY ----------
    const cleanSubtotal = Number(subtotal);
    const cleanDeliveryFee = Number(deliveryFee);
    const cleanTotalAmount = Number(totalAmount);

    if (
      !Number.isFinite(cleanSubtotal) ||
      !Number.isFinite(cleanDeliveryFee) ||
      !Number.isFinite(cleanTotalAmount)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
      });
    }

    if (cleanSubtotal < 0 || cleanDeliveryFee < 0 || cleanTotalAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Order amounts cannot be negative.",
      });
    }

    const finalOrderNumber =
      orderNumber || `FRAG-${Math.floor(100000 + Math.random() * 900000)}`;

    // ---------- DUPLICATE PAYMENT ----------
    if (paymentReference) {
      const existingOrder = await Order.findOne({ paymentReference });

      if (existingOrder) {
        return res.status(409).json({
          success: false,
          message: "An order already exists for this payment.",
          order: existingOrder,
        });
      }
    }

    // ---------- REDUCE STOCK (atomic) ----------
    for (const item of cleanedProducts) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          quantity: { $gte: item.quantity },
        },
        {
          $inc: {
            quantity: -item.quantity,
            sold: item.quantity,
          },
        },
        { new: true },
      );

      if (!updatedProduct) {
        const stockError = new Error(
          `Not enough stock available for ${item.name}. The product may have just been purchased by another customer.`,
        );
        stockError.isStockError = true;
        throw stockError;
      }

      updatedProducts.push({
        product: item.product,
        quantity: item.quantity,
      });
    }

    // ---------- SAVE ORDER ----------
    const order = new Order({
      orderNumber: finalOrderNumber,
      user: cleanUser,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      deliveryAddress: {
        address: deliveryAddress.address.trim(),
        city: deliveryAddress.city.trim(),
        postalCode: deliveryAddress.postalCode.trim(),
        ...(deliveryAddress.province && {
          province: deliveryAddress.province.trim(),
        }),
        ...(deliveryAddress.country && {
          country: deliveryAddress.country.trim(),
        }),
      },
      products: cleanedProducts,
      subtotal: Number(cleanSubtotal.toFixed(2)),
      deliveryFee: Number(cleanDeliveryFee.toFixed(2)),
      totalAmount: Number(cleanTotalAmount.toFixed(2)),
      paymentMethod,
      paymentReference: paymentReference || undefined,
      paymentStatus: "paid",
      orderStatus: "processing",
      paidAt: new Date(),
    });

    const savedOrder = await order.save();

    // ---------- CONFIRMATION EMAIL (never blocks or breaks the order) ----------
    const productList = savedOrder.products
      .map(
        (item) =>
          `${item.name} x ${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`,
      )
      .join("\n");

    const emailText = `
Hello ${savedOrder.customer.name},

Thank you for shopping with FragCents!

Your payment has been received and your order is confirmed.

ORDER DETAILS
Order Number: ${savedOrder.orderNumber}
Payment Method: ${savedOrder.paymentMethod}
Payment Reference: ${savedOrder.paymentReference || "N/A"}

PRODUCTS
${productList}

Subtotal: R${Number(savedOrder.subtotal).toFixed(2)}
Delivery Fee: R${Number(savedOrder.deliveryFee).toFixed(2)}
TOTAL PAID: R${Number(savedOrder.totalAmount).toFixed(2)}

DELIVERY ADDRESS
${savedOrder.deliveryAddress.address}
${savedOrder.deliveryAddress.city}
${savedOrder.deliveryAddress.province || ""}
${savedOrder.deliveryAddress.postalCode}
${savedOrder.deliveryAddress.country || ""}

Your order is now being processed. We will keep you updated.

Regards,
FragCents Customer Support
`;

    sendEmail(
      savedOrder.customer.email,
      `FragCents Order Confirmation - ${savedOrder.orderNumber}`,
      emailText,
    ).catch((emailError) => {
      console.error(
        "Order saved, but confirmation email failed:",
        emailError.message,
      );
    });

    console.log(
      `ORDER SAVED: ${savedOrder.orderNumber} (${savedOrder._id}) - R${savedOrder.totalAmount}`,
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully and stock updated.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error.message);

    // Put the stock back if we already reduced it
    if (updatedProducts.length > 0) {
      console.log("Rolling back stock changes...");

      for (const updated of updatedProducts) {
        try {
          await Product.findByIdAndUpdate(updated.product, {
            $inc: {
              quantity: updated.quantity,
              sold: -updated.quantity,
            },
          });
        } catch (rollbackError) {
          console.error(
            `CRITICAL: Failed to roll back stock for ${updated.product}`,
            rollbackError,
          );
        }
      }
    }

    return res.status(error.isStockError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to create order.",
    });
  }
});

router.get("/order/mine", requireSignIn, getMyOrders);
router.get("/orders", requireSignIn, isAdmin, getAllOrders);
router.get("/finance-summary", requireSignIn, isManager, getFinanceSummary);
router.put("/order/:id/status", requireSignIn, isAdmin, updateOrderStatus);

export default router;
