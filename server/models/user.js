import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 64,
    },
    address: {
  street: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "" },
  province: { type: String, trim: true, default: "" },
  postalCode: { type: String, trim: true, default: "" },
  country: { type: String, trim: true, default: "" }
},
  phone: {
    type: String,
    trim: true,
   
  },
    role:{
        type: Number,
        default: 0,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
}, {timestamps: true});

export default mongoose.model("User", userSchema);