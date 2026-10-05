import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 2000,
    },
    price: {
      type: Number,
      required: true,
      min: 2,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: true,
    },
    supplier: {
      type: ObjectId,
      ref: "Supplier",
      required: false,
    },
    quantity: {
      type: Number,
    },
    sold: {
      type: Number,
      default: 0,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    shipping: {
      required: false,
      type: Boolean,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
