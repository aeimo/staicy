import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

import { authRoutes } from './api/auth';
import { documentRoutes } from './api/documents';
import { diagramRoutes } from './api/diagrams';
import { integrationRoutes } from './api/integrations';
import { aiRoutes } from './api/ai';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { collaborationService } from './services/collaborationService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);
app.use('/api/diagrams', authMiddleware, diagramRoutes);
app.use('/api/integrations', authMiddleware, integrationRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// Error handling
app.use(errorHandler);

// Socket.io for real-time collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-document', (documentId: string) => {
    socket.join(`document-${documentId}`);
    collaborationService.handleUserJoin(socket, documentId);
  });

  socket.on('leave-document', (documentId: string) => {
    socket.leave(`document-${documentId}`);
    collaborationService.handleUserLeave(socket, documentId);
  });

  socket.on('document-change', (data) => {
    collaborationService.handleDocumentChange(socket, data);
  });

  socket.on('cursor-position', (data) => {
    collaborationService.handleCursorPosition(socket, data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    collaborationService.handleUserDisconnect(socket);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export { io };
