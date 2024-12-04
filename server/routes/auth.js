import express from 'express';

const router = express.Router();

//middlewares
import { requireSignIn, isAdmin } from '../middlewares/auth.js';

//controllers
import {register, login, secret} from "../controllers/auth.js";
import { createCategory } from '../controllers/product_Catergory.js';

router.post('/register', register);
router.post('/login', login);
router.post('/category', createCategory)
//testing

router.get('/secret', requireSignIn, isAdmin, secret);

export default router;