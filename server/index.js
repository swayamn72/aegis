import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createServer } from 'http';
import { Server } from 'socket.io';
import NodeCache from 'node-cache';

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
import communityRoutes from './routes/community.routes.js';
import communityPostRoutes from './routes/communityPost.routes.js';
import orgTournamentRoutes from './routes/orgTournament.routes.js';
import teamTournamentRoutes from './routes/teamTournament.routes.js';
import adminOrgTournamentRoutes from './routes/adminOrgTournament.routes.js';
import supportRoutes from './routes/support.routes.js';
import teamApplicationRoutes from './routes/teamApplication.routes.js';
import tryoutChatRoutes from './routes/tryoutChat.routes.js';
import forgotPassRoutes from "./routes/forgotpass.routes.js";
import rewardRoutes from "./routes/reward.routes.js";
import googleRoutes from "./routes/google.routes.js";
import recruitmentRoutes from './routes/recruitment.routes.js';
import notificationRoutes from './routes/notification.routes.js';


// Import Models
import './models/player.model.js';
import './models/team.model.js';
import './models/tournament.model.js';
import './models/match.model.js';
import './models/admin.model.js';
import './models/organization.model.js';
import './models/teamApplication.model.js';
import './models/tryoutChat.model.js';
import './models/recruitmentApproach.model.js';
import './models/teamInvitation.model.js';
import './models/chat.model.js';


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
  limits: { fileSize: 5 * 1024 * 1024 },
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
app.use('/api/reward', rewardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/community-posts', communityPostRoutes);
app.use('/api/org-tournaments', orgTournamentRoutes);
app.use('/api/team-tournaments', teamTournamentRoutes);
app.use('/api/admin/org-tournaments', adminOrgTournamentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/team-applications', teamApplicationRoutes);
app.use('/api/tryout-chats', tryoutChatRoutes);
app.use("/api", forgotPassRoutes);
app.use('/api/auth', googleRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/notifications', notificationRoutes);


const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// Make io globally available
global.io = io;

const messageCache = new NodeCache({ stdTTL: 300 }); // 5 min cache

io.on('connection', (socket) => {
  console.log('New Client Joined', socket.id);

  socket.on('join', (playerId) => {
    socket.join(playerId);
    console.log(`Player ${playerId} joined room`);
  });

  // Direct message handler with caching
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

      // Invalidate cache for both users
      messageCache.del(`chat_${senderId}_${receiverId}`);
      messageCache.del(`chat_${receiverId}_${senderId}`);

      io.to(receiverId).emit('receiveMessage', msgToEmit);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // JOIN TRYOUT/GROUP CHAT ROOM
  socket.on('joinTryoutChat', (chatId) => {
    socket.join(`tryout_${chatId}`);
    console.log(`Socket ${socket.id} joined tryout chat room: tryout_${chatId}`);
  });

  // LEAVE TRYOUT/GROUP CHAT ROOM
  socket.on('leaveTryoutChat', (chatId) => {
    socket.leave(`tryout_${chatId}`);
    console.log(`Socket ${socket.id} left tryout chat room: tryout_${chatId}`);
  });

  // GROUP/TRYOUT MESSAGE HANDLER
  socket.on('tryoutMessage', async ({ chatId, senderId, message }) => {
    console.log(`Tryout chat ${chatId}: ${senderId} -> ${message}`);

    try {
      const TryoutChat = (await import('./models/tryoutChat.model.js')).default;

      const chat = await TryoutChat.findById(chatId);
      if (!chat) {
        console.error('Tryout chat not found:', chatId);
        return;
      }

      const newMessage = {
        sender: senderId,
        message: message,
        messageType: 'text',
        timestamp: new Date()
      };

      chat.messages.push(newMessage);
      await chat.save();

      const savedMessage = chat.messages[chat.messages.length - 1];

      io.to(`tryout_${chatId}`).emit('tryoutMessage', {
        chatId: chatId,
        message: {
          _id: savedMessage._id,
          sender: savedMessage.sender,
          message: savedMessage.message,
          messageType: savedMessage.messageType,
          timestamp: savedMessage.timestamp
        }
      });

      console.log(`Emitted tryout message to room: tryout_${chatId}`);
    } catch (error) {
      console.error('Error handling tryout message:', error);
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
