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

// CREATE ORDER
// Supports:
// - Logged-in users
// - Guest users
// - Paystack payments
//
// IMPORTANT:
// - Stock is reduced ONLY for paid orders
// - Product quantity is reduced
// - Product sold is increased
// - FragCents confirmation email is sent
//   after a paid order is saved
// =====================================

router.post("/create", async (req, res) => {
  try {
    console.log("\n=================================");
    console.log("CREATE ORDER REQUEST");
    console.log("=================================");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=================================\n");

    const {
      orderNumber,
      user,
      customer,
      deliveryAddress,
      products,
      subtotal,
      deliveryFee,
      totalAmount,

      // PAYMENT
      paymentMethod,
      paymentReference,
      paymentStatus,
      orderStatus,
      paidAt,
    } = req.body;

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

    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: "Customer information is missing.",
      });
    }

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

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order products are missing.",
      });
    }

    const cleanedProducts = [];

    for (const item of products) {
      console.log("Checking product:", item);

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

      if (
        !Number.isFinite(quantity) ||
        quantity < 1 ||
        !Number.isInteger(quantity)
      ) {
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

      // =====================================
      // CHECK PRODUCT
      // =====================================

      const productExists = await Product.findById(
        item.product
      );
      const productExists = await Product.findById(item.product);

      if (!productExists) {
        return res.status(400).json({
          success: false,
          message:
            `Product does not exist in database: ${item.product}`,
        });
      }

      // =====================================
      // CHECK CURRENT STOCK
      // =====================================

      const availableQuantity = Number(
        productExists.quantity || 0
      );
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

    // =====================================
    // MONEY
    // =====================================
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

    if (
      cleanSubtotal < 0 ||
      cleanDeliveryFee < 0 ||
      cleanTotalAmount < 0
    ) {
    if (cleanSubtotal < 0 || cleanDeliveryFee < 0 || cleanTotalAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Order amounts cannot be negative.",
      });
    }

    const finalOrderNumber =
      orderNumber ||
      `FRAG-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

    // =====================================
    // CHECK DUPLICATE PAYMENT
    // =====================================

    if (paymentReference) {
      const existingOrder = await Order.findOne({
        paymentReference,
      });

      if (existingOrder) {
        return res.status(409).json({
          success: false,
          message:
            "An order already exists for this payment.",
          order: existingOrder,
        });
      }
    }

    // =====================================
    // CREATE ORDER
    // =====================================

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

      subtotal: Number(
        cleanSubtotal.toFixed(2)
      ),

      deliveryFee: Number(
        cleanDeliveryFee.toFixed(2)
      ),

      totalAmount: Number(
        cleanTotalAmount.toFixed(2)
      ),

      paymentMethod:
        paymentMethod || "Paystack",

      paymentReference:
        paymentReference || undefined,

      paymentStatus:
        paymentStatus || "pending",

      orderStatus:
        orderStatus || "pending",

      paidAt:
        paidAt || undefined,
    });

    // =====================================
    // REDUCE STOCK ONLY AFTER PAYMENT
    // =====================================

    if (paymentStatus === "paid") {
     
      console.log("PAYMENT IS PAID");
      console.log("UPDATING PRODUCT STOCK");
      

      for (const item of cleanedProducts) {
        const product = await Product.findById(
          item.product
        );

        if (!product) {
          throw new Error(
            `Product not found while updating stock: ${item.product}`
          );
        }

        const currentQuantity = Number(
          product.quantity || 0
        );

        const purchaseQuantity = Number(
          item.quantity
      orderNumber || `FRAG-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedProducts = [];

    try {
      for (const item of cleanedProducts) {
        console.log(`Updating stock for ${item.name}...`);

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

        // Safety check
        if (
          currentQuantity < purchaseQuantity
        ) {
          throw new Error(
            `Not enough stock for ${product.name}. ` +
            `Available: ${currentQuantity}, ` +
            `Requested: ${purchaseQuantity}`
            `Not enough stock available for ${item.name}. The product may have just been purchased by another customer.`,
          );
        }

        // Reduce stock
        product.quantity =
          currentQuantity - purchaseQuantity;

        // Increase sold count
        product.sold =
          Number(product.sold || 0) +
          purchaseQuantity;

        await product.save();

        console.log(
          `Product: ${product.name}`
        );

        console.log(
          `Quantity before: ${currentQuantity}`
        );

        console.log(
          `Quantity purchased: ${purchaseQuantity}`
        );

        console.log(
          `Quantity after: ${product.quantity}`
        );

        console.log(
          `Sold: ${product.sold}`
        );

        console.log("---------------------------------");
      }

      console.log(
        "PRODUCT STOCK UPDATED SUCCESSFULLY"
      );

      console.log(
        "=================================\n"
      );
    }

    // =====================================
    // SAVE ORDER
    // =====================================

    const savedOrder = await order.save();

    // =====================================
    // SEND FRAGCENTS CONFIRMATION EMAIL
    // ONLY AFTER PAID ORDER IS SAVED
    // =====================================

    if (savedOrder.paymentStatus === "paid") {
      try {
        // Create product list
        const productList = savedOrder.products
          .map(
            (item) =>
              `${item.name} x${item.quantity} - R${Number(
                item.price
              ).toFixed(2)}`
          )
          .join("\n");

        // Create email
        const emailText = `
Hello ${savedOrder.customer.name},

Thank you for shopping with FragCents!

Your payment has been successfully received and your order has been confirmed.

ORDER DETAILS

Order Number: ${savedOrder.orderNumber}

Payment Method: ${savedOrder.paymentMethod}

Payment Reference: ${
          savedOrder.paymentReference || "N/A"
        }

Payment Status: ${savedOrder.paymentStatus}

Order Status: ${savedOrder.orderStatus}


PRODUCTS

${productList}

        console.log(`Stock updated: ${updatedProduct.name}`);
        console.log(`Remaining quantity: ${updatedProduct.quantity}`);
        console.log(`Total sold: ${updatedProduct.sold}`);
      }

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
        paymentStatus: "paid",
        orderStatus: "processing",
        paidAt: new Date(),
      });

      const savedOrder = await order.save();

      try {
        const itemsText = savedOrder.products
          .map(
            (item) =>
              `${item.name} x ${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`,
          )
          .join("\n");

ORDER TOTAL
=================================

Subtotal: R${Number(
          savedOrder.subtotal
        ).toFixed(2)}

Delivery Fee: R${Number(
          savedOrder.deliveryFee
        ).toFixed(2)}

TOTAL PAID: R${Number(
          savedOrder.totalAmount
        ).toFixed(2)}


DELIVERY ADDRESS
=================================

${savedOrder.deliveryAddress.address}

${savedOrder.deliveryAddress.city}

${savedOrder.deliveryAddress.province || ""}

${savedOrder.deliveryAddress.postalCode}

${savedOrder.deliveryAddress.country || ""}


Your order is now being processed.

We will keep you updated as your order moves through the delivery process.

Thank you for choosing FragCents!

Regards,

FragCents
Customer Support
`;

        // Send email
        await sendEmail(
          savedOrder.customer.email,
          `FragCents Order Confirmation - ${savedOrder.orderNumber}`,
          emailText
        );

        console.log(
          
        );

        console.log(
          "FRAGCENTS CONFIRMATION EMAIL SENT"
          `Fragcents Order Confirmation - ${savedOrder.orderNumber}`,
          emailText,
        );

        console.log(
          `Order confirmation email sent to ${savedOrder.customer.email}`,
        );

        console.log(
          "Email:",
          savedOrder.customer.email
        );

        console.log(
          
        );

      } catch (emailError) {
        // Email failure should NOT cancel the order
        console.error(
          
        );

        console.error(
          "FRAGCENTS EMAIL ERROR"
        );

        console.error(
          emailError.message
        );

        console.error(
          "================================="
        );
      }
    }

    // =====================================
    // SUCCESS
    // =====================================

    console.log("\n=================================");
    console.log("ORDER SAVED SUCCESSFULLY");
    console.log("=================================");

    console.log(
      "Order ID:",
      savedOrder._id
    );

    console.log(
      "Order Number:",
      savedOrder.orderNumber
    );

    console.log(
      "Payment Method:",
      savedOrder.paymentMethod
    );

    console.log(
      "Payment Reference:",
      savedOrder.paymentReference
    );

    console.log(
      "Payment Status:",
      savedOrder.paymentStatus
    );

    console.log(
      "Order Status:",
      savedOrder.orderStatus
    );

    console.log(
      "Total:",
      savedOrder.totalAmount
    );

    console.log(
      "=================================\n"
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order: savedOrder,
    });

  } catch (error) {
    console.error(
      
    );

    console.error(
      "CREATE ORDER ERROR"
    );

    console.error(
     
    );

        console.error(
          "Order was saved, but confirmation email failed:",
          emailError.message,
        );
      }

      console.log("\n=================================");
      console.log("ORDER SAVED TO MONGODB");
      console.log("=================================");
      console.log("Order ID:", savedOrder._id);
      console.log("Order Number:", savedOrder.orderNumber);
      console.log("User:", savedOrder.user || "GUEST CHECKOUT");
      console.log("Payment:", savedOrder.paymentMethod);
      console.log("Total:", savedOrder.totalAmount);

      console.log("\nSTOCK UPDATED:");
      for (const updated of updatedProducts) {
        console.log(`Product ${updated.product}: -${updated.quantity}`);
      }
      console.log("=================================\n");

      return res.status(201).json({
        success: true,
        message: "Order created successfully and stock updated.",
        order: savedOrder,
      });
    } catch (stockOrOrderError) {
      console.error(
        "Order creation/stock update failed:",
        stockOrOrderError.message,
      );

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
            console.log(`Stock restored for product ${updated.product}`);
          } catch (rollbackError) {
            console.error(
              `CRITICAL: Failed to rollback stock for ${updated.product}`,
              rollbackError,
            );
          }
        }
      }

      return res.status(400).json({
        success: false,
        message: stockOrOrderError.message || "Failed to create order.",
      });
    }
  } catch (error) {
    console.error("\n=================================");
    console.error("CREATE ORDER ERROR");
    console.error("=================================");
    console.error(error);

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "=================================\n"
    );

    return res.status(500).json({
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
