// server/index.js

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import playerRoutes from './routes/player.routes.js'; // 1. Import the new routes
import cookieParser from "cookie-parser";




dotenv.config();

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Add this middleware to log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connection established'))
  .catch((error) => console.error('❌ MongoDB connection failed:', error.message));

// Test route
app.get('/', (req, res) => {
  res.send('Hello from the Aegis Backend!');
});

// 2. Tell Express to use the player routes
app.use('/api/players', playerRoutes);

app.listen(port, () => {
  console.log(`✅ Server is running on port: ${port}`);
});