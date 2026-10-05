import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.js";
import Product from "../models/product.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    console.log("===== PAYFAST CREATE REQUEST =====");
    console.log(req.body);

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
      paymentStatus,
      orderStatus,
      paidAt,
      amount,
      itemName,
      itemDescription,
    } = req.body;

    // --------------------------------------------------
    // USER VALIDATION
    // --------------------------------------------------

    if (user && !mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // --------------------------------------------------
    // CUSTOMER VALIDATION
    // --------------------------------------------------

    if (
      !customer ||
      !customer.name ||
      !customer.email ||
      !customer.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer information is missing.",
      });
    }

    // --------------------------------------------------
    // DELIVERY ADDRESS VALIDATION
    // --------------------------------------------------

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

    // --------------------------------------------------
    // PRODUCTS VALIDATION
    // --------------------------------------------------

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products were provided.",
      });
    }

    // --------------------------------------------------
    // CHECK PRODUCTS AND STOCK
    // --------------------------------------------------

    const cleanedProducts = [];

    for (const item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.product}`,
        });
      }

      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      const quantity = Number(item.quantity);
      const price = Number(item.price);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}.`,
        });
      }

      if (Number(product.quantity) < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock.`,
        });
      }

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}.`,
        });
      }

      cleanedProducts.push({
        product: product._id,
        name: item.name || product.name,
        quantity,
        price,
      });
    }

    // --------------------------------------------------
    // AMOUNT
    // --------------------------------------------------

    const cleanTotalAmount = Number(
      totalAmount ?? amount
    );

    if (!Number.isFinite(cleanTotalAmount) || cleanTotalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount.",
      });
    }

    // --------------------------------------------------
    // PAYMENT REFERENCE
    // --------------------------------------------------

    const finalPaymentReference =
      paymentReference ||
      `FRAG-${Date.now()}`;

    // --------------------------------------------------
    // CHECK DUPLICATE PAYMENT REFERENCE
    // --------------------------------------------------

    const existingOrder = await Order.findOne({
      paymentReference: finalPaymentReference,
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Payment reference already exists.",
      });
    }

    // --------------------------------------------------
    // CREATE ORDER NUMBER
    // --------------------------------------------------

    const finalOrderNumber =
      orderNumber ||
      `FRAG-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

    // --------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------

    const order = new Order({
      orderNumber: finalOrderNumber,

      user: user || null,

      customer,

      deliveryAddress,

      products: cleanedProducts,

      subtotal: Number(subtotal || 0),

      deliveryFee: Number(deliveryFee || 0),

      totalAmount: Number(cleanTotalAmount.toFixed(2)),

      paymentMethod: paymentMethod || "PayFast",

      paymentReference: finalPaymentReference,

      paymentStatus: paymentStatus || "pending",

      orderStatus: orderStatus || "pending",

      paidAt: paidAt || null,
    });

    const savedOrder = await order.save();

    console.log("===== ORDER CREATED =====");
    console.log(savedOrder);

    // --------------------------------------------------
    // PAYFAST GENERATED FORM DATA
    // --------------------------------------------------

    const formData = {
      cmd: "_paynow",
      receiver: "15410288",
      amount: cleanTotalAmount.toFixed(2),
      item_name:
        itemName ||
        `FragCents Order ${savedOrder.orderNumber}`,
      item_description:
        itemDescription ||
        "Payment for FragCents order",
    };

    console.log("===== PAYFAST FORM DATA =====");
    console.log(formData);

    // --------------------------------------------------
    // RETURN PAYFAST FORM
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "PayFast payment created.",

      paymentUrl:
        "https://payment.payfast.io/eng/process",

      paymentReference:
        finalPaymentReference,

      orderNumber:
        savedOrder.orderNumber,

      formData,
    });
  } catch (error) {
    console.error("===== PAYFAST CREATE ERROR =====");
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create PayFast payment.",
    });
  }
});

export default router;