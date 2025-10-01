import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createServer } from 'http';
import { Server } from 'socket.io';


// Import Routes
import playerRoutes from './routes/player.routes.js';
import tournamentRoutes from './routes/tournament.routes.js';
import adminRoutes from './routes/admin.routes.js';
import matchRoutes from './routes/match.routes.js';
import feedRoutes from './routes/feed.routes.js';
import connectionRoutes from './routes/connection.routes.js';
import chatRoutes from './routes/message.routes.js';
import teamRoutes from './routes/team.routes.js';
import postRoutes from './routes/post.routes.js';
import ChatMessage from './models/chat.model.js';
import organizationRoutes from './routes/organization.routes.js';

// Import Models to register with Mongoose
import './models/player.model.js';
import './models/team.model.js';
import './models/tournament.model.js';
import './models/match.model.js';
import './models/admin.model.js';
import './models/organization.model.js';

// Load environment variables
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
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


// Debugging middleware: log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connection established'))
  .catch((error) => console.error('❌ MongoDB connection failed:', error.message));

// Test route
app.get('/', (req, res) => {
  res.send('Hello from the Aegis Backend!');
});

// Routes
app.use('/api/players', playerRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/organizations', organizationRoutes)



const server = createServer(app);


const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});


io.on('connection', (socket) => {
  console.log('New Client Joined', socket.id);

  
  socket.on('join', (playerId) => {
    socket.join(playerId);
    console.log(`Player ${playerId} joined room`);
  });

  
  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    console.log(`${senderId} -> ${receiverId}: ${message}`);

    const msgData = {
      senderId,
      receiverId,
      message,
      timestamp: new Date(),
    };

    try {
      const savedMessage = await ChatMessage.create(msgData);
      const msgToEmit = {
        _id: savedMessage._id,
        ...msgData,
      };

      // Emit to receiver (sender adds locally in client)
      io.to(receiverId).emit('receiveMessage', msgToEmit);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`✅ Server is running on port: ${port}`);
});
