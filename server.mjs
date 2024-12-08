import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import cartRoutes from './routes/cartRoutes.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', cartRoutes);

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'Fregcent', 'index.html'));
});

// Static assets (CSS, JS, images, favicon, etc.)
app.use(express.static(path.join(path.resolve(), 'Fregcent')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://db:7Yhnd81U5jIlI1Tg@fragcents.isrmk.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Handle favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'Fregcent', 'favicon.ico'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
