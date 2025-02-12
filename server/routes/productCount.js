import express from 'express';

const router = express.Router();

//middlewares
// import { requireSignIn, isAdmin } from '../middlewares/auth.js';

//controllers
import { getProductCount } from "../controllers/productCount.js";


router.get('/productcount', getProductCount);

export default  router;
