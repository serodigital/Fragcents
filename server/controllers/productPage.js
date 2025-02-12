import Product from '../models/product.js';

// Get paginated products
export const getPaginatedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 6; // Products per page
    const skip = (page - 1) * limit; // Calculate skip value

    // Fetch paginated products
    const products = await Product.find().skip(skip).limit(limit);

    // Count total products
    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
