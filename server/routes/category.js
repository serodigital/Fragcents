import express from 'express';

const router = express.Router();

//middlewares
import { requireSignIn, isAdmin } from '../middlewares/auth.js';

//controllers
import {secret} from "../controllers/auth.js";
import { createCategory ,getAllCategories,updateCategory, deleteCategory} from '../controllers/catergory.js';


router.post('/category', createCategory) // Endpoint to create a new category
router.get('/category',getAllCategories) // Endpoint to fetch all Categories
router.put('/category',updateCategory) // Endpoint to update a Categories by ID
router.delete('/category', deleteCategory) // Endpoint to delete a Categories by ID
//testing

router.get('/secret', requireSignIn, isAdmin, secret);

export default router;