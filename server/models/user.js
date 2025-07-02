import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
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
      lowercase: true, // Ensures email is always lowercase
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please fill a valid email address'], // Email validation regex
      index: true,  // Adding index for faster lookup
    },
    password: {
      type: String,
      required: true,
      min: [6, 'Password must be at least 6 characters long'], // Minimum length validation
      max: [64, 'Password must be no more than 64 characters'],
    },
    address: {
      type: String,
      trim: true,
    },
    role: {
      type: Number,
      default: 0, // Default role as 0 (user)
    },
  },
  { timestamps: true }
);

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      // Hash the password before saving it
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      next(err);
    }
  }
  next();
});
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};
export default mongoose.model('User', userSchema);
