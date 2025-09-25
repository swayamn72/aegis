import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import playerRoutes from './routes/player.routes.js'; // 1. Import the new routes
import tournamentRoutes from './routes/tournament.routes.js'; // Import tournament routes
import adminRoutes from './routes/admin.routes.js'; // Import admin routes
import matchRoutes from './routes/match.routes.js'; // Import match routes
import cookieParser from "cookie-parser";
import feedRoutes from './routes/feed.routes.js'
import connectionRoutes from './routes/connection.routes.js';


import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Import all models to ensure they're registered with mongoose
import './models/player.model.js';
import './models/team.model.js';
import './models/tournament.model.js';
import './models/match.model.js';
import './models/admin.model.js';
import './models/org.model.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matches', matchRoutes); // Add match routes
app.use("/api/feed", feedRoutes);
app.use('/api/connections', connectionRoutes);



app.listen(port, () => {
  console.log(`✅ Server is running on port: ${port}`);
});