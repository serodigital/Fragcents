import express from 'express';
import { requireSignIn, isAdmin } from '../middlewares/auth.js';
import { register, login, secret, forgotPassword, resetPassword } from "../controllers/auth.js";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Testing route
router.get('/secret', requireSignIn, isAdmin, secret);

export default router;