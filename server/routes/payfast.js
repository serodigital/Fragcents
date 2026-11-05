import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { createHash } from "crypto";
import { sendEmail } from "../utils/email.js";

const router = express.Router();
function generatePayFastSignature(data) {
  const passphrase = process.env.PAYFAST_PASSPHRASE;

  if (!passphrase) {
    throw new Error("PAYFAST_PASSPHRASE is not configured.");
  }

  const fields = Object.entries(data)
    .filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    )
    .map(([key, value]) => {
      const encodedValue = encodeURIComponent(
        String(value).trim()
      )
        .replace(/%20/g, "+")
        .replace(/[!'()*]/g, (character) =>
          `%${character.charCodeAt(0).toString(16).toUpperCase()}`
        );

      return `${key}=${encodedValue}`;
    })
    .join("&");

  const encodedPassphrase = encodeURIComponent(
    passphrase.trim()
  )
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`
    );

  return createHash("md5")
    .update(`${fields}&passphrase=${encodedPassphrase}`)
    .digest("hex");
}

function verifyPayFastITNSignature(data) {
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const receivedSignature = data.signature;

  if (!passphrase || !receivedSignature) {
    console.error("PayFast signature or passphrase is missing.");
    return false;
  }

  const fields = Object.entries(data)
    .filter(
      ([key, value]) =>
        key !== "signature" &&
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    )
    .map(([key, value]) => {
      const encodedValue = encodeURIComponent(
        String(value).trim()
      )
        .replace(/%20/g, "+")
        .replace(/[!'()*]/g, (character) =>
          `%${character.charCodeAt(0)
            .toString(16)
            .toUpperCase()}`
        );

      return `${key}=${encodedValue}`;
    })
    .join("&");

  const encodedPassphrase = encodeURIComponent(
    passphrase.trim()
  )
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (character) =>
      `%${character.charCodeAt(0)
        .toString(16)
        .toUpperCase()}`
    );

  const expectedSignature = createHash("md5")
    .update(`${fields}&passphrase=${encodedPassphrase}`)
    .digest("hex");

  return expectedSignature ===
    String(receivedSignature).toLowerCase();
}

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

     paymentStatus: "pending",
orderStatus: "pending",
paidAt: null,
    });

    const savedOrder = await order.save();

    console.log("===== ORDER CREATED =====");
    console.log(savedOrder);

    // --------------------------------------------------
    // PAYFAST GENERATED FORM DATA
    // --------------------------------------------------

 // --------------------------------------------------
// PAYFAST CUSTOM INTEGRATION FORM DATA
// --------------------------------------------------

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl || frontendUrl.includes("localhost")) {
  throw new Error(
    "Set FRONTEND_URL to your deployed FragCents website URL."
  );
}

const customerName = String(customer.name).trim().split(/\s+/);
const firstName = customerName.shift() || "";
const lastName = customerName.join(" ");

const formData = {
  // Merchant details
  merchant_id: process.env.PAYFAST_MERCHANT_ID,
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,

  return_url: frontendUrl,
  cancel_url: frontendUrl,

  notify_url:
    process.env.PAYFAST_NOTIFY_URL ||
    "https://fragcents-backend.onrender.com/api/payfast/notify",

  // Customer details
  name_first: firstName,
  name_last: lastName,
  email_address: customer.email,
  cell_number: customer.phone,

  // Transaction details
  m_payment_id: finalPaymentReference,
  amount: cleanTotalAmount.toFixed(2),

  item_name: String(
    itemName || `FragCents Order ${savedOrder.orderNumber}`
  ).slice(0, 100),

  item_description: String(
    itemDescription || "Payment for FragCents order"
  ).slice(0, 255),
};

// Generate the signature AFTER all payment fields are added.
formData.signature = generatePayFastSignature(formData);

console.log("===== PAYFAST FORM CREATED =====");
console.log({
  ...formData,
  merchant_key: "[REDACTED]",
  signature: "[GENERATED]",
});



    // --------------------------------------------------
    // RETURN PAYFAST FORM
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      message: "PayFast payment created.",

      paymentUrl:
        "https://www.payfast.co.za/eng/process",

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

// --------------------------------------------------
// PAYFAST ITN / NOTIFY
// --------------------------------------------------

async function validateWithPayFast(data) {
  try {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(data)) {
      if (
        value !== undefined &&
value !== null
      ) {
        params.append(key, String(value));
      }
    }

    const response = await fetch(
      "https://www.payfast.co.za/eng/query/validate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      console.error(
        "PayFast validation HTTP status:",
        response.status
      );
      return false;
    }

    const result = (await response.text()).trim();

    console.log("PayFast server validation:", result);

    return result === "VALID";
  } catch (error) {
    console.error(
      "PayFast server validation failed:",
      error.message
    );
    return false;
  }
}

router.post("/notify", async (req, res) => {
  try {
    console.log("===== PAYFAST ITN NOTIFICATION =====");
    console.log(req.body);

    // Verify the notification signature before processing it.
if (!verifyPayFastITNSignature(req.body)) {
  console.error("Rejected PayFast notification: invalid signature.");

  return res.status(400).send("Invalid signature.");
}
// Validate the notification directly with PayFast.
const isValidNotification = await validateWithPayFast(req.body);

if (!isValidNotification) {
  console.error("Rejected PayFast notification: server validation failed.");

  return res.status(400).send("PayFast validation failed.");
}
    const {
      m_payment_id,
      payment_status,
      amount_gross,
        merchant_id,

    } = req.body;
if (
  String(merchant_id) !==
  String(process.env.PAYFAST_MERCHANT_ID)
) {
  console.error("Rejected notification: merchant ID mismatch.");
  return res.status(400).send("Merchant ID mismatch.");
}
    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

    if (!m_payment_id) {
      console.log("❌ Missing payment reference.");
      return res.status(400).send(
        "Missing payment reference."
      );
    }

    if (!payment_status) {
      console.log("❌ Missing payment status.");
      return res.status(400).send(
        "Missing payment status."
      );
    }

    // --------------------------------------------------
    // FIND ORDER
    // --------------------------------------------------

    const order = await Order.findOne({
      paymentReference: m_payment_id,
    });

    if (!order) {
      console.log(
        "❌ Order not found:",
        m_payment_id
      );

      return res.status(404).send(
        "Order not found."
      );
    }

    console.log(
      "✅ Order found:",
      order.orderNumber
    );

    // --------------------------------------------------
    // CHECK PAYMENT AMOUNT
    // --------------------------------------------------

    const receivedAmount = Number(amount_gross);
    const orderAmount = Number(order.totalAmount);

    if (
      !Number.isFinite(receivedAmount) ||
      Math.abs(receivedAmount - orderAmount) > 0.01
    ) {
      console.log("❌ Payment amount mismatch.");
      console.log("Expected:", orderAmount);
      console.log("Received:", receivedAmount);

      return res.status(400).send(
        "Amount mismatch."
      );
    }

    

    // --------------------------------------------------
    // PAYMENT COMPLETE
    // --------------------------------------------------

    if (payment_status === "COMPLETE") {
      const session = await mongoose.startSession();

      let processedOrder = null;
      let alreadyProcessed = false;

      try {
        await session.withTransaction(async () => {
          // Always check the latest order status.
          const currentOrder = await Order.findById(
            order._id
          ).session(session);

          if (!currentOrder) {
            throw new Error("Order not found.");
          }

          // Prevent duplicate stock deductions.
          if (currentOrder.paymentStatus === "paid") {
            alreadyProcessed = true;
            return;
          }

          if (currentOrder.paymentStatus !== "pending") {
            throw new Error(
              "Order is not pending payment."
            );
          }

          // Reduce stock only when enough stock exists.
          // If any item fails, the entire transaction rolls back.
          for (const item of currentOrder.products) {
            const quantity = Number(item.quantity);

            const updatedProduct =
              await Product.findOneAndUpdate(
                {
                  _id: item.product,
                  quantity: { $gte: quantity },
                },
                {
                  $inc: {
                    quantity: -quantity,
                    sold: quantity,
                  },
                },
                {
                  new: true,
                  session,
                }
              );

            if (!updatedProduct) {
              throw new Error(
                `Product missing or insufficient stock: ${item.name}`
              );
            }
          }

          // Mark the order paid in the same transaction.
          currentOrder.paymentStatus = "paid";
          currentOrder.orderStatus = "processing";
          currentOrder.paidAt = new Date();

          await currentOrder.save({ session });

          processedOrder = currentOrder;
        });
      } finally {
        await session.endSession();
      }

      if (alreadyProcessed) {
        console.log(
          "Payment already processed:",
          order.orderNumber
        );

        return res.status(200).send(
          "Already processed."
        );
      }

      // Send the customer confirmation after the
      // payment and stock transaction has committed.
      try {
        await sendEmail(
          processedOrder.customer.email,
          `FragCents Order Confirmed - ${processedOrder.orderNumber}`,
          `Hello ${processedOrder.customer.name},

We have confirmed your payment.

Order number: ${processedOrder.orderNumber}
Amount paid: R${Number(
            processedOrder.totalAmount
          ).toFixed(2)}
Order status: Processing

Thank you for shopping with FragCents.`
        );

        console.log(
          "Order confirmation email sent:",
          processedOrder.orderNumber
        );
      } catch (emailError) {
        // Do not undo a successful payment because
        // an email could not be sent.
        console.error(
          "Order confirmation email failed:",
          emailError.message
        );
      }

      console.log(
        "PAYMENT CONFIRMED:",
        processedOrder.orderNumber
      );

      return res.status(200).send(
        "Payment confirmed."
      );
    }

// --------------------------------------------------
// PAYMENT FAILED / CANCELLED
// --------------------------------------------------

if (
  payment_status === "FAILED" ||
  payment_status === "CANCELLED"
) {
  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: order._id,
      paymentStatus: "pending",
    },
    {
      $set: {
        paymentStatus: "failed",
        orderStatus: "cancelled",
      },
    },
    { new: true }
  );

  if (!updatedOrder) {
    const latestOrder = await Order.findById(order._id);

    if (latestOrder?.paymentStatus === "paid") {
      console.log(
        "Ignoring failed notification for paid order:",
        latestOrder.orderNumber
      );

      return res.status(200).send(
        "Order already paid."
      );
    }

    return res.status(200).send(
      "Order is no longer pending."
    );
  }

  console.log(
    "PAYMENT FAILED/CANCELLED:",
    updatedOrder.orderNumber
  );

  return res.status(200).send(
    "Payment failed."
  );
}


    // --------------------------------------------------
    // OTHER PAYFAST STATUS
    // --------------------------------------------------

    console.log(
      "ℹ️ PayFast status:",
      payment_status
    );

    return res.status(200).send(
      "Notification received."
    );
  } catch (error) {
    console.error(
      "===== PAYFAST ITN ERROR ====="
    );
    console.error(error);

    return res.status(500).send(
      "Internal server error."
    );
  }
});

export default router;