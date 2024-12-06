import Product from '../models/category.js'; // Updated model import
import dotenv from 'dotenv';

dotenv.config();

// ADD a new Product
export const createProduct = async (req, res) => {
    try {
        // Destructure fields from req.body
        const { name, gender, price } = req.body;

        // 1. Validate fields
        if (!name.trim()) {
            return res.json({ error: "Name is required" });
        }
        if (!gender.trim()) {
            return res.json({ error: "Gender is required" });
        }
        if (typeof price !== 'number' || price < 0) {
            return res.json({ error: "Price must be a positive number" });
        }

        // 2. Check if Product name already exists
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.json({ error: "Product name already exists" });
        }

        // 3. Generate slug
        const slug = name.toLowerCase().replace(/ /g, '-');

        // 4. Save Product
        const product = await new Product({
            name,
            gender,
            price,
            slug,
        }).save();

        // 5. Send response
        res.status(201).json({
            message: "Product created successfully",
            product: {
                name: product.name,
                gender: product.gender,
                price: product.price,
                slug: product.slug,
            },
        });

    } catch (err) {
        console.error(err);
        res.json({ error: "An error occurred while creating the product" });
    }
};

// Retrieve all Products
export const getAllProducts = async (req, res) => {
    try {
        // Fetch all Products
        const products = await Product.find().sort({ createdAt: -1 });

        // Send response
        res.json({ products });
    } catch (err) {
        console.error(err);
        res.json({ error: "An error occurred while retrieving products" });
    }
};

// Update a Product by ID
export const updateProduct = async (req, res) => {
    try {
        const { id ,name, gender, price } = req.body; //Extract from req.body

        // Validate ID
        if (!id) {
            return res.json({ error: "Product ID is required" });
        }

        // Find Product by ID and update fields
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { name, gender, price },
            { new: true, runValidators: true }
        );

        // If Product not found
        if (!updatedProduct) {
            return res.json({ error: "Product not found" });
        }

        // Send response
        res.json({
            message: "Product updated successfully",
            product: updatedProduct,
        });

    } catch (err) {
        console.error(err);
        res.json({ error: "An error occurred while updating the product" });
    }
};

// Delete a Product by ID
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.body; // Get Product ID from URL

        // Validate ID
        if (!id) {
            return res.json({ error: "Product ID is required" });
        }

        // Find and delete the Product
        const deletedProduct = await Product.findByIdAndDelete(id);

        // If Product not found
        if (!deletedProduct) {
            return res.json({ error: "Product not found" });
        }

        // Send response
        res.json({ message: "Product deleted successfully" });

    } catch (err) {
        console.error(err);
        res.json({ error: "An error occurred while deleting product" });
    }
};
