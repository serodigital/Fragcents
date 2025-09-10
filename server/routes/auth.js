import express from 'express';
import { requireSignIn, isAdmin } from '../middlewares/auth.js';
import { register, login, secret } from "../controllers/auth.js";
import { sendEmail } from "../utils/email.js"; // Import your email utility

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Testing route
router.get('/secret', requireSignIn, isAdmin, secret);

// =======================
// Send password email
// =======================
router.post('/send-password-email', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    await sendEmail(
      email,
      "Your FragCents Account Password",
      `Hi, your password is: ${password}`
    );

    res.json({ success: true, message: "Password email sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
