import mongoose from "mongoose";
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const orderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    deliveryAddress: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
