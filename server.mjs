import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import { fileURLToPath } from 'url';

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
  .connect('mongodb+srv://db:7Yhnd81U5jIlI1Tg@fragcents.isrmk.mongodb.net/?retryWrites=true&w=majority&appName=Fragcents', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas (Fragcents Database)');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// Define the cart item schema
const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});
const CartItem = mongoose.model('CartItem', cartItemSchema);

// Define the /cart endpoint
app.post('/cart', async (req, res) => {
  console.log('Received cart data:', req.body); 

  const { userId, cart } = req.body;

  if (!userId || !Array.isArray(cart)) {
    return res.status(400).send('Invalid request format');
  }

  try {
    for (const item of cart) {
      const cleanPrice =
        typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.-]/g, '')) : item.price;
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

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
