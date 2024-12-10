import express from 'express';
import formidable from "express-formidable";

const router = express.Router();

//middlewares
import { requireSignIn, isAdmin } from '../middlewares/auth.js';

//controllers
import { createProduct, getAllProducts, updateProduct, deleteProduct, read, create } from '../controllers/product.js';


// router.post('/product', requireSignIn, isAdmin, createProduct); // Endpoint to Create a new product
router.get('/product', getAllProducts); // Endpoint to Retrieve all products
// router.get('/product/:slug', read); //Endpoint to Retrieve a single product by slug
router.put('/product/:productId', updateProduct); // Endpoint to Update a product by ID
router.delete('/product/:productId', deleteProduct); // Endpoint to Delete a product by ID
router.get('/product/:slug', requireSignIn, isAdmin, read) //Endpoint to Retrieve a single product by slug
//testing
router.post('/products', requireSignIn, isAdmin, formidable(), create); // Endpoint to Create a new product


export default router;
