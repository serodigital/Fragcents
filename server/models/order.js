import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // =====================================
    // ORDER NUMBER
    // =====================================
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // =====================================
    // USER
    // Optional because guest checkout is allowed
    // =====================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =====================================
    // CUSTOMER INFORMATION
    // =====================================
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // =====================================
    // DELIVERY ADDRESS
    // =====================================
    deliveryAddress: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      postalCode: {
        type: String,
        required: true,
        trim: true,
      },
      province: {
        type: String,
        required: false,
        trim: true,
      },
      country: {
        type: String,
        required: false,
        trim: true,
      },
    },

    // =====================================
    // PRODUCTS
    // =====================================
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    // =====================================
    // ORDER AMOUNTS
    // =====================================
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =====================================
    // PAYFAST PAYMENT METHOD
    // =====================================
    paymentMethod: {
      type: String,
      enum: [
        "PayFast - Credit/Debit Card",
        "PayFast - Instant EFT",
        "PayFast - Capitec Pay",
      ],
      required: true,
    },

    // =====================================
    // PAYMENT STATUS
    // =====================================
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // =====================================
    // ORDER STATUS
    // =====================================
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // =====================================
    // PAYMENT DATE
    // =====================================
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
