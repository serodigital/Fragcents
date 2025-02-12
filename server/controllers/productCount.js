const ProductCount = require("../models/product.js");

// Count all products in the database
const getProductCount = async (req, res) => {
  try {
    const count = await ProductCount.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while counting products." });
  }
};

module.exports = { getProductCount };
