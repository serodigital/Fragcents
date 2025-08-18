import Product from '../models/product.js';
import dotenv from 'dotenv';
import slugify from 'slugify';
import fs from 'fs';
import mongoose from 'mongoose';

dotenv.config();

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

// Create product with image upload
export const create = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;

    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!description?.trim()) return res.status(400).json({ error: 'Description is required' });
    if (!price?.trim()) return res.status(400).json({ error: 'Price is required' });
    if (!category?.trim()) return res.status(400).json({ error: 'Category is required' });
    if (!quantity?.trim()) return res.status(400).json({ error: 'Quantity is required' });
    if (!shipping?.trim()) return res.status(400).json({ error: 'Shipping is required' });
    if (photo && photo.size > 1_000_000) return res.status(400).json({ error: 'Image should be less than 1MB' });

    const existing = await Product.findOne({ name: name.trim(), description: description.trim() });
    if (existing) return res.status(400).json({ error: 'Product with this name and description already exists' });

    const product = new Product({
      ...req.fields,
      slug: slugify(name.trim(), { lower: true }),
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      quantity: parseInt(quantity),
    });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    const responseProduct = await Product.findById(product._id).select('-photo');
    res.status(201).json(responseProduct);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Error creating product', details: err.message });
  }
};

// Create product alternative (no image upload)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, AvailableInBulk, category, quantity, shipping } = req.body;

    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!description?.trim()) return res.status(400).json({ error: 'Description is required' });
    if (typeof price !== 'number' || price <= 0) return res.status(400).json({ error: 'Price must be a positive number' });
    if (AvailableInBulk !== undefined && typeof AvailableInBulk !== 'boolean') return res.status(400).json({ error: 'AvailableInBulk must be boolean' });

    const existing = await Product.findOne({ name: name.trim(), description: description.trim() });
    if (existing) return res.status(400).json({ error: 'Product with this name and description already exists' });

    const product = await new Product({
      name: name.trim(),
      description: description.trim(),
      price,
      slug: slugify(name.trim(), { lower: true }),
      AvailableInBulk: AvailableInBulk || false,
      category: category || '',
      quantity: quantity || 0,
      shipping: shipping || '',
    }).save();

    res.status(201).json(product);
  } catch (err) {
    console.error('Create product (no file) error:', err);
    res.status(500).json({ error: 'Error creating product', details: err.message });
  }
};

// Get all products without images
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).select('-photo').sort({ createdAt: -1 });
    res.json({ products, count: products.length });
  } catch (err) {
    console.error('Get all products error:', err);
    res.status(500).json({ error: 'Failed to get products', details: err.message });
  }
};

// Update product by ID
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) return res.status(400).json({ error: 'Invalid product ID' });

    const updateData = {};
    const fields = ['name', 'description', 'price', 'AvailableInBulk', 'category', 'quantity', 'shipping'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
        if (field === 'name') updateData.slug = slugify(req.body.name.trim(), { lower: true });
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    }).select('-photo');

    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });

    res.json(updatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) return res.status(400).json({ error: 'Invalid product ID' });

    const deletedProduct = await Product.findByIdAndDelete(productId).select('-photo');
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });

    res.json({ message: 'Product deleted', product: deletedProduct });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
};

// Read product by slug
export const read = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug?.trim()) return res.status(400).json({ error: 'Product slug required' });

    const product = await Product.findOne({ slug: slug.trim() });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error('Read product error:', err);
    res.status(500).json({ error: 'Error fetching product', details: err.message });
  }
};

// Read product by ID without photo data
export const readById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid product ID' });

    const product = await Product.findById(id).select('-photo');
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error('Read product by ID error:', err);
    res.status(500).json({ error: 'Error fetching product', details: err.message });
  }
};

// Serve product photo by ID
export const getProductPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid product ID' });

    const product = await Product.findById(id).select('photo');
    if (!product || !product.photo?.data) return res.status(404).json({ error: 'Photo not found' });

    res.set('Content-Type', product.photo.contentType);
    res.send(product.photo.data);
  } catch (err) {
    console.error('Get product photo error:', err);
    res.status(500).json({ error: 'Error fetching photo', details: err.message });
  }
};

// List products with pagination
export const listProducts = async (req, res) => {
  try {
    const perPage = 6;
    const page = Math.max(parseInt(req.params.page) || 1, 1);

    const products = await Product.find({})
      .select('-photo')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();
    const totalPages = Math.ceil(total / perPage);

    res.json({
      products,
      currentPage: page,
      totalPages,
      total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ error: 'Error fetching products', details: err.message });
  }
};

// Get product count
export const productCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Product count error:', err);
    res.status(500).json({ error: 'Error fetching count', details: err.message });
  }
};
