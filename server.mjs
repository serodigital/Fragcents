import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config(); // Load environment variables from .env file

const app = express();

// Set up middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

// Define __dirname manually for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "Fragcents" directory
app.use(express.static(path.join(__dirname, 'Fragcents')));

// Serve favicon.ico (ensure it's in the "Fragcents" folder)
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'Fragcents', 'favicon.ico'));
});

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// Define the cart item schema
const cartItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Create a model for cart items
const CartItem = mongoose.model('CartItem', cartItemSchema);

// Route to handle saving cart data
app.post('/cart', async (req, res) => {
  console.log('Received cart data:', req.body); // Log the incoming request

  const { userId, cart } = req.body;

  if (!userId || !Array.isArray(cart)) {
    return res.status(400).send('Invalid request format');
  }

  try {
    // Loop through each item and process it
    for (const item of cart) {
      // Clean price field if it's in "R100.00" format (strip 'R' and parse the number)
      const cleanPrice = typeof item.price === 'string'
        ? parseFloat(item.price.replace(/[^\d.-]/g, ''))
        : item.price;

      const productName = item.productName || item.name;

      const existingItem = await CartItem.findOne({ userId, productId: item.productId || productName });

      if (existingItem) {
        // If item already exists, update the quantity
        existingItem.quantity += item.quantity;
        await existingItem.save();
        console.log('Updated cart item:', existingItem);
      } else {
        // If item doesn't exist, create a new cart item
        const cartItem = new CartItem({
          userId,
          productId: item.productId || productName,
          productName: productName,
          quantity: item.quantity,
          price: cleanPrice,
        });

        await cartItem.save();
        console.log('Cart item saved:', cartItem);
      }
    }

    res.send('Cart saved/updated successfully');
  } catch (error) {
    console.error('Error saving cart item:', error.message);
    res.status(500).send('Error saving cart item to database');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
