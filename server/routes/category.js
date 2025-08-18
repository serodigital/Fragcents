import express from 'express';

const router = express.Router();

// Middleware
import { requireSignIn, isAdmin } from '../middlewares/auth.js';

// Controllers
import { secret } from "../controllers/auth.js";
import { createCategory ,getAllCategories,updateCategory, deleteCategory, read} from '../controllers/catergory.js';

// CRUD Category Routes
router.post('/categories', requireSignIn, isAdmin, createCategory); // Create a new category
router.get('/categories', getAllCategories); // Fetch all categories
router.put('/categories/:categoryId', requireSignIn, isAdmin, updateCategory); // Update a category
router.delete('/categories/:categoryId', requireSignIn, isAdmin, deleteCategory); // Delete a category
router.get("/categories/:slug", read); // Public category details

// Testing route
router.get('/secret', requireSignIn, isAdmin, secret);

export default router;
