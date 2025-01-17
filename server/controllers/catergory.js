import Category from '../models/category.js';
import dotenv from 'dotenv';
import slugify from "slugify";

dotenv.config();

 //Create a new category

export const createCategory = async (req, res) => {
    try {
        // Destructure fields from req.body
        const { name } = req.body;

        // 1. Validate fields
        if (!name.trim()) {
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
            slug: slugify(name),
        }).save();
        // 5. Send response
        res.json(category);

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "An error occurred while creating the category" });
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
        const { name } = req.body;
        const { categoryId } = req.params;
        
        // Find category by ID and update fields
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { 
                name,
                slug: slugify(name),
            },
            { new: true}
        );
        res.json(updatedCategory);

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "An error occurred while updating the category" });
    }
};

 // Delete a category by ID
export const deleteCategory = async (req, res) => {
    try {
    
        const deletedCategory = await Category.findByIdAndDelete(req.params.categoryId);

        if (!deletedCategory) {
            return res.json({ error: "Category not found" });
        }

        res.json(deleteCategory);

    } catch (err) {
        console.error(err);
        res.json({ error: "An error occurred while deleting the category" });
    }
};

export const read = async (req, res) => {
    try{
        const category = await Category.findOne({
            slug: req.params.slug
        });
        res.json(category);
    }
    catch (err)
    {
        console.log(err);
        return res.status(400).json(err.message);
    }
}
