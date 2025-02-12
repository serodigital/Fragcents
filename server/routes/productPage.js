import express from 'express';

const router = express.Router();


import { getPaginatedProducts } from '../controllers/productPage.js';


router.get('/productsPerPage', getPaginatedProducts);

export default router;
