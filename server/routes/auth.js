import express from 'express';

const router = express.Router();

//middlewares
import { requireSignIn, isAdmin } from '../middlewares/auth.js';

//controllers
import {register, login, secret} from "../controllers/auth.js";


router.post("/register", register);
router.post("/login", login);
router.get("/auth-check", requireSignIn, (req, res) => {
    res.json({ ok: true });
}); // checks token if user is logged in

router.get("/admin-check", requireSignIn , (req, res) => {
    res.json({ ok: true });
}); // router to check if admin

//testing

router.get('/secret', requireSignIn, isAdmin, secret);

export default router;