import Product from '../models/product.js';
import dotenv from 'dotenv';
import slugify from "slugify";

dotenv.config();

 //Create a new product

export const createProduct = async (req, res) => {
    try {
        // Destructure fields from req.body
        const { name, description, gender, price, AvailableInBulk } = req.body;

        // 1. Validate fields
        if (!name || !name.trim()) {
            return res.json({ error: "Name is required" });
        }
        if (!description || !description.trim()) {
            return res.json({ error: "Description is required" });
        }
        if (!gender || !gender.trim()) {
            return res.json({ error: "Gender is required" });
        }
        if (typeof price !== 'number' || price <= 0) {
            return res.json({ error: "Price must be a positive number" });
        }
        if (typeof AvailableInBulk !== 'boolean' && AvailableInBulk !== undefined) {
            return res.json({ error: "must provide if product is available or Not" });
        }

        // 2. Check if product name & description already exists
        const existingProduct = await Product.findOne({ name,description });
        if (existingProduct & description) {
            return res.json({ error: "Product name and description already exists" });
        }

        // 3. Generate slug
        const slug = name.toLowerCase().replace(/ /g, '-');

        // 4. Save product
        const product = await new Product({
            name,
            description,
            gender,
            price,
            slug: slugify(name),
            AvailableInBulk: AvailableInBulk || false, // Default to false if not provided
        }).save();

        // 5. Send response
        res.json(product);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while creating the product" });
    }
};

 //Retrieve all products
export const getAllProducts = async (req, res) => {
    try {
        // Fetch all products
        const products = await Product.find().sort({ createdAt: -1 });

        res.json({ products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while retrieving products" });
    }
};

 // Update a product by ID
export const updateProduct = async (req, res) => {
    try {
        const { name, description, gender, price, AvailableInBulk } = req.body;
        const { productId } = req.params;

        // Validate fields
        if (name && !name.trim()) {
            return res.json({ error: "Name is required" });
        }
        if (description && !description.trim()) {
            return res.json({ error: "Description is required" });
        }
        if (gender && !gender.trim()) {
            return res.json({ error: "Gender is required" });
        }
        if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
            return res.json({ error: "Price must be a positive number" });
        }
        if (AvailableInBulk !== undefined && typeof AvailableInBulk !== 'boolean') {
            return res.json({ error: "must provide if product is available or Not" });
        }

        // Find product by ID and update fields
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { 
                name,
                description,
                gender,
                price,
                slug: name ? slugify(name) : undefined,
                AvailableInBulk,
            },
            { new: true }
        );
        res.json(updatedProduct);

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "An error occurred while updating the product" });
    }
};

 // Delete a product by ID
export const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.productId);

        if (!deletedProduct) {
            return res.json({ error: "Product not found" });
        }

        res.json(deletedProduct);

    } catch (err) {
        console.error(err);
        res.json({ error: "An error occurred while deleting the product" });
    }
};

export const read = async (req, res) => {
    try{
        const product = await Product.findOne({
            slug: req.params.slug
        });
        res.json(product);
    }
    catch (err)
    {
        console.log(err);
        return res.status(400).json(err.message);
    }
}
