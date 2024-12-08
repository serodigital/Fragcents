const Cart = require('../models/Cart');

exports.addToCart = async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    let item = await Cart.findOne({ name });
    if (item) {
      // If it exists, update the quantity
      item.quantity += 1;
    } else {
      // If not, create a new item
      item = new Cart({ name, price, description, image });
    }
    await item.save();
    res.status(200).json({ success: true, message: 'Item added to cart', cartItem: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
