require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/E-commerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));
const cartItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    inStock: { type: Boolean, default: true },
}, { collection: 'Information' }); // Specify the collection name

// Create the Cart Item model
const CartItem = mongoose.model('CartItem', cartItemSchema);

// API Routes

// Add item to cart
app.post('/cart/add', async (req, res) => {
    try {
        const { name, price } = req.body;
        const newItem = new CartItem({ name, price });
        await newItem.save();
        res.status(201).json({ message: 'Item added to cart', item: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item', error });
    }
});
app.get('/cart', async (req, res) => {
    try {
        const cartItems = await CartItem.find();
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart items', error });
    }
});
app.put('/cart/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const updatedItem = await CartItem.findByIdAndUpdate(id, { quantity }, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item updated', item: updatedItem });
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error });
    }
});
app.delete('/cart/remove/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await CartItem.findByIdAndDelete(id);
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item removed from cart', item: deletedItem });
    } catch (error) {
        res.status(500).json({ message: 'Error removing item', error });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
