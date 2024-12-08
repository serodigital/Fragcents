import express from 'express';

const router = express.Router();

router.get('/cart', (req, res) => {
  res.send('Cart route');
});
export default router;
