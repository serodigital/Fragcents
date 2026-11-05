import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
  orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

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

    paymentMethod: {
      type: String,
      required: true,
      default: "PayFast",
    },

    paymentReference: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

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
