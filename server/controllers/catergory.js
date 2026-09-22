import Category from "../models/category.js";
import dotenv from "dotenv";
import slugify from "slugify";

dotenv.config();

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.json({ error: "Name is required" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.json({ error: "Category name already exists" });
    }

    const category = await new Category({
      name,
      description: description ? description.trim() : "",
      slug: slugify(name),
    }).save();

    res.json(category);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while creating the category" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving categories" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { categoryId } = req.params;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        description: description !== undefined ? description.trim() : undefined,
        slug: slugify(name),
      },
      { new: true },
    );
    res.json(updatedCategory);
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ error: "An error occurred while updating the category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(
      req.params.categoryId,
    );

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
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
    });
    res.json(category);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};
