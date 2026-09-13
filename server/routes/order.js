import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

// =====================================
// CREATE ORDER
// Supports:
// - Logged-in users
// - Guest users
//
// IMPORTANT:
// - Only paid orders reduce stock
// - Product quantity is reduced
// - Product sold is increased
// - Cannot purchase more than available stock
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
      paymentMethod,
    } = req.body;

    // =====================================
    // USER
    // =====================================

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

    // =====================================
    // CUSTOMER
    // =====================================

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

    // =====================================
    // DELIVERY ADDRESS
    // =====================================

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

    // =====================================
    // PRODUCTS
    // =====================================

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order products are missing.",
      });
    }

    // =====================================
    // VALIDATE PRODUCTS
    // =====================================

    const cleanedProducts = [];

    for (const item of products) {
      console.log("Checking product:", item);

      // -------------------------------------
      // Product ID
      // -------------------------------------

      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: `Product ID is missing for ${
            item.name || "an item"
          }.`,
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID for ${
            item.name || "an item"
          }: ${item.product}`,
        });
      }

      // -------------------------------------
      // Product name
      // -------------------------------------

      if (!item.name) {
        return res.status(400).json({
          success: false,
          message: "Product name is missing.",
        });
      }

      // -------------------------------------
      // Quantity
      // -------------------------------------

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

      // -------------------------------------
      // Price
      // -------------------------------------

      const price = Number(item.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${item.name}.`,
        });
      }

      // -------------------------------------
      // Check product exists
      // -------------------------------------

      const productExists = await Product.findById(item.product);

      if (!productExists) {
        return res.status(400).json({
          success: false,
          message: `Product does not exist in database: ${item.product}`,
        });
      }

      // -------------------------------------
      // Check stock
      // -------------------------------------

      const availableQuantity = Number(
        productExists.quantity || 0
      );

      if (availableQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `${productExists.name} is sold out.`,
        });
      }

      if (quantity > availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${productExists.name}. Only ${availableQuantity} left.`,
        });
      }

      // -------------------------------------
      // Add cleaned product
      // -------------------------------------

      cleanedProducts.push({
        product: item.product,
        name: productExists.name.trim(),
        quantity,
        price,
      });
    }

    // =====================================
    // PAYMENT METHOD
    // =====================================

    const allowedPaymentMethods = [
      "PayFast - Credit/Debit Card",
      "PayFast - Instant EFT",
      "PayFast - Capitec Pay",
    ];

    if (
      !paymentMethod ||
      !allowedPaymentMethods.includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing PayFast payment method.",
      });
    }

    // =====================================
    // MONEY
    // =====================================

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

    // Prevent negative amounts

    if (
      cleanSubtotal < 0 ||
      cleanDeliveryFee < 0 ||
      cleanTotalAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Order amounts cannot be negative.",
      });
    }

    // =====================================
    // ORDER NUMBER
    // =====================================

    const finalOrderNumber =
      orderNumber ||
      `FRAG-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

    // =====================================
    // IMPORTANT:
    // REDUCE PRODUCT STOCK
    // =====================================
    //
    // We only reach this section after:
    // - Customer information is valid
    // - Address is valid
    // - Products are valid
    // - Products exist
    // - Enough stock exists
    // - PayFast payment method is valid
    //
    // We reduce quantity and increase sold.

    const updatedProducts = [];

    try {
      for (const item of cleanedProducts) {
        console.log(
          `Updating stock for ${item.name}...`
        );

        // Atomically decrease stock only if
        // enough stock still exists.

        const updatedProduct =
          await Product.findOneAndUpdate(
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
            {
              new: true,
            }
          );

        // -------------------------------------
        // Stock changed between validation
        // and update
        // -------------------------------------

        if (!updatedProduct) {
          throw new Error(
            `Not enough stock available for ${item.name}. The product may have just been purchased by another customer.`
          );
        }

        updatedProducts.push({
          product: item.product,
          quantity: item.quantity,
        });

        console.log(
          `Stock updated: ${updatedProduct.name}`
        );

        console.log(
          `Remaining quantity: ${updatedProduct.quantity}`
        );

        console.log(
          `Total sold: ${updatedProduct.sold}`
        );
      }

      // =====================================
      // CREATE ORDER
      // =====================================

      const order = new Order({
        orderNumber: finalOrderNumber,

        // Logged-in user:
        // MongoDB ObjectId
        //
        // Guest:
        // null
        user: cleanUser,

        // -------------------------------------
        // Customer
        // -------------------------------------

        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
        },

        // -------------------------------------
        // Delivery address
        // -------------------------------------

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

        // -------------------------------------
        // Products
        // -------------------------------------

        products: cleanedProducts,

        // -------------------------------------
        // Amounts
        // -------------------------------------

        subtotal: Number(
          cleanSubtotal.toFixed(2)
        ),

        deliveryFee: Number(
          cleanDeliveryFee.toFixed(2)
        ),

        totalAmount: Number(
          cleanTotalAmount.toFixed(2)
        ),

        // -------------------------------------
        // Payment
        // -------------------------------------

        paymentMethod,

        paymentStatus: "paid",

        // -------------------------------------
        // Order status
        // -------------------------------------

        orderStatus: "processing",

        paidAt: new Date(),
      });

      // =====================================
      // SAVE ORDER
      // =====================================

      const savedOrder = await order.save();
      // =====================================
      // SEND ORDER CONFIRMATION EMAIL
      // =====================================

      try {
        const itemsText = savedOrder.products
          .map(
            (item) =>
              `${item.name} x ${item.quantity} - R${(
                item.price * item.quantity
              ).toFixed(2)}`
          )
          .join("\n");

        const emailText = `
FRAGCENTS - ORDER CONFIRMATION
=================================

Thank you for your order, ${savedOrder.customer.name}!

Your payment was successful and your order has been received.

ORDER DETAILS
-------------
Order Number: ${savedOrder.orderNumber}
Order Status: ${savedOrder.orderStatus}
Payment Status: ${savedOrder.paymentStatus}
Payment Method: ${savedOrder.paymentMethod}
Payment Date: ${savedOrder.paidAt.toLocaleString()}

CUSTOMER INFORMATION
--------------------
Name: ${savedOrder.customer.name}
Email: ${savedOrder.customer.email}
Phone: ${savedOrder.customer.phone}

DELIVERY ADDRESS
----------------
${savedOrder.deliveryAddress.address}
${savedOrder.deliveryAddress.city}
${savedOrder.deliveryAddress.postalCode}
${savedOrder.deliveryAddress.province || ""}
${savedOrder.deliveryAddress.country || ""}

ITEMS ORDERED
-------------
${itemsText}

ORDER SUMMARY
-------------
Subtotal: R${savedOrder.subtotal.toFixed(2)}
Delivery Fee: R${savedOrder.deliveryFee.toFixed(2)}
TOTAL PAID: R${savedOrder.totalAmount.toFixed(2)}

=================================

Thank you for shopping with Fragcents!

Your order is currently being processed.

Fragcents
`;

        await sendEmail(
          savedOrder.customer.email,
          `Fragcents Order Confirmation - ${savedOrder.orderNumber}`,
          emailText
        );

        console.log(
          `Order confirmation email sent to ${savedOrder.customer.email}`
        );
      } catch (emailError) {
        // Do NOT fail the order if the email fails
        console.error(
          "Order was saved, but confirmation email failed:",
          emailError.message
        );
      }
      // =====================================
      // SUCCESS LOG
      // =====================================

      console.log("\n=================================");
      console.log("ORDER SAVED TO MONGODB");
      console.log("=================================");
      console.log("Order ID:", savedOrder._id);
      console.log(
        "Order Number:",
        savedOrder.orderNumber
      );
      console.log(
        "User:",
        savedOrder.user || "GUEST CHECKOUT"
      );
      console.log(
        "Payment:",
        savedOrder.paymentMethod
      );
      console.log(
        "Total:",
        savedOrder.totalAmount
      );

      console.log("\nSTOCK UPDATED:");

      for (const updated of updatedProducts) {
        console.log(
          `Product ${updated.product}: -${updated.quantity}`
        );
      }

      console.log("=================================\n");

      // =====================================
      // RESPONSE
      // =====================================

      return res.status(201).json({
        success: true,
        message:
          "Order created successfully and stock updated.",
        order: savedOrder,
      });

    } catch (stockOrOrderError) {
      // =====================================
      // ROLLBACK STOCK IF ORDER CREATION FAILS
      // =====================================
      //
      // If we successfully reduced stock for one
      // or more products but something fails later,
      // restore that stock.

      console.error(
        "Order creation/stock update failed:",
        stockOrOrderError.message
      );

      if (updatedProducts.length > 0) {
        console.log(
          "Rolling back stock changes..."
        );

        for (const updated of updatedProducts) {
          try {
            await Product.findByIdAndUpdate(
              updated.product,
              {
                $inc: {
                  quantity: updated.quantity,
                  sold: -updated.quantity,
                },
              }
            );

            console.log(
              `Stock restored for product ${updated.product}`
            );
          } catch (rollbackError) {
            console.error(
              `CRITICAL: Failed to rollback stock for ${updated.product}`,
              rollbackError
            );
          }
        }
      }

      return res.status(400).json({
        success: false,
        message:
          stockOrOrderError.message ||
          "Failed to create order.",
      });
    }

  } catch (error) {
    console.error("\n=================================");
    console.error("CREATE ORDER ERROR");
    console.error("=================================");
    console.error(error);
    console.error("Message:", error.message);
    console.error("=================================\n");

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create order.",
    });
  }
});

export default router;