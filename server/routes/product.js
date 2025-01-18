import express from 'express';
import formidable from "express-formidable";

const router = express.Router();

//middlewares
import { requireSignIn, isAdmin } from '../middlewares/auth.js';

//controllers
import { createProduct, getAllProducts, updateProduct, deleteProduct, read, create, photo, list, update } from '../controllers/product.js';


// router.post('/product', requireSignIn, isAdmin, createProduct); // Endpoint to Create a new product
router.get('/products', getAllProducts); // Endpoint to Retrieve all products
// router.get('/product/:slug', read); //Endpoint to Retrieve a single product by slug
router.put('/product/:productId', requireSignIn, isAdmin, formidable(), update); // Endpoint to Update a product by ID
router.delete('/product/:productId', requireSignIn, isAdmin, deleteProduct); // Endpoint to Delete a product by ID
router.get('/product/:slug', read) //Endpoint to Retrieve a single product by slug
router.get('/product/photo/:productId', photo);
//testing
router.post('/products', requireSignIn, isAdmin, formidable(), create); // Endpoint to Create a new product


export default router;
