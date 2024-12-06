import express from 'express';

const router = express.Router();

//middlewares
import { requireSignIn, isAdmin } from '../middlewares/auth.js';

//controllers
import {register, login, secret} from "../controllers/auth.js";
import { createProduct ,getAllProducts,updateProduct, deleteProduct} from '../controllers/productCatergory.js';

router.post('/register', register);
router.post('/login', login);

router.post('/product', createProduct) // Endpoint to create a new product
router.get('/products',getAllProducts) // Endpoint to fetch all product
router.put('/products/:id',updateProduct) // Endpoint to update a product by ID
router.delete('/products/:id', deleteProduct) // Endpoint to delete a product by ID
//testing

router.get('/secret', requireSignIn, isAdmin, secret);

export default router;