import express from 'express';

const router = express.Router();

//middlewares
import { requireSignIn, isAdmin } from '../middlewares/auth.js';

//controllers
import {secret} from "../controllers/auth.js";
import { createCategory ,getAllCategories,updateCategory, deleteCategory, read} from '../controllers/catergory.js';


router.post('/category', requireSignIn, isAdmin, createCategory) // Endpoint to create a new category
router.get('/category',getAllCategories) // Endpoint to fetch all Categories
router.put('/category/:categoryId', requireSignIn, isAdmin,updateCategory) // Endpoint to update a Categories by ID
router.delete('/category/:categoryId', requireSignIn, isAdmin, deleteCategory) // Endpoint to delete a Categories by ID
router.get("/category/:slug", requireSignIn, isAdmin,read); 
//testing

router.get('/secret', requireSignIn, isAdmin, secret);

export default router;