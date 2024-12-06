import Category from '../models/category.js';
import dotenv from 'dotenv';

dotenv.config();

 //Create a new category

export const createCategory = async (req, res) => {
    try {
        // Destructure fields from req.body
        const { name } = req.body;

        // 1. Validate fields
        if (!name || !name.trim()) {
            return res.json({ error: "Name is required" });
        }

        // 2. Check if category name already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.json({ error: "Category name already exists" });
        }

        // 3. Generate slug
        const slug = name.toLowerCase().replace(/ /g, '-');

        // 4. Save category
        const category = await new Category({
            name,
            slug,
        }).save();

        // 5. Send response
        res.json({
            message: "Category created successfully",
            category: {
                name: category.name,          
                slug: category.slug,
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while creating the category" });
    }
};

 //Retrieve all categories
export const getAllCategories = async (req, res) => {
    try {
        // Fetch all categories
        const categories = await Category.find().sort({ createdAt: -1 });

        res.json({ categories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while retrieving categories" });
    }
};

 // Update a category by ID
export const updateCategory = async (req, res) => {
    try {
        const { id ,name } = req.body;

        if (!id) {
            return res.json({ error: "Category ID is required" });
        }

        // Find category by ID and update fields
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.json({ error: "Category not found" });
        }

        res.json({
            message: "Category updated successfully",
            category: updatedCategory,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while updating the category" });
    }
};

 // Delete a category by ID
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body; 

        if (!id) {
            return res.json({ error: "Category ID is required" });
        }

        // Find and delete the category
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.json({ error: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });

    } catch (err) {
        console.error(err);
        res.json({ error: "An error occurred while deleting the category" });
    }
};
