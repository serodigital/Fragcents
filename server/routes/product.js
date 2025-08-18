import express from 'express';
import formidable from "express-formidable";
import { requireSignIn, isAdmin } from '../middlewares/auth.js';
import Product from '../models/product.js';
import { 
  createProduct, 
  getAllProducts, 
  updateProduct, 
  deleteProduct, 
  read, 
  create, 
  listProducts, 
  productCount, 
  readById 
} from '../controllers/product.js';

const router = express.Router();

// Public route: Get product by ID (frontend)
router.get('/products/:id', readById);

// Admin route: Get product by slug (protected)
router.get('/product/:slug', requireSignIn, isAdmin, read);

// Other routes
router.get('/products', getAllProducts);
router.put('/product/:productId', requireSignIn, isAdmin, updateProduct);
router.delete('/product/:productId', requireSignIn, isAdmin, deleteProduct);
router.get('/list-products/:page', listProducts);
router.get('/countProduct', productCount);
router.post('/products', requireSignIn, isAdmin, formidable(), create);
router.post('/product', requireSignIn, isAdmin, createProduct);

// Fixed route to serve image
router.get('/product/image/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select('photo');
    if (product && product.photo && product.photo.data) {
      res.set('Content-Type', product.photo.contentType);
      return res.send(product.photo.data);
    } else {
      return res.status(404).send('No image found');
    }
  } catch (err) {
    console.error('Error fetching image:', err);
    return res.status(500).send('Error fetching image');
  }
});

export default router;
