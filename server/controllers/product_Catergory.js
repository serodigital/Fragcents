import Category from '../models/category.js';
import dotenv from 'dotenv';

dotenv.config();

export const createCategory = async (req, res) => {
    try {
        // Destructure fields from req.body
        const { name, class: categoryClass, price } = req.body;

        // 1. Validate fields
        if (!name || !name.trim()) {
            return res.json({ error: "Name is required" });
        }
        if (!categoryClass || !categoryClass.trim()) {
            return res.json({ error: "Class is required" });
        }
        if (price === undefined || typeof price !== 'number' || price < 0) {
            return res.json({ error: "Price must be a positive number" });
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
            class: categoryClass,
            price,
            slug,
        }).save();

        // 5. Send response
        res.json({
            message: "Category created successfully",
            category: {
                name: category.name,
                class: category.class,
                price: category.price,
                slug: category.slug,
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while creating the category" });
    }
};
