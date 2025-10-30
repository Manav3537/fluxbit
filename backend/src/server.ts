import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import annotationRoutes from './routes/annotationRoutes';
import dataRoutes from './routes/dataRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/annotations', annotationRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join:dashboard', (dashboardId) => {
    socket.join(`dashboard:${dashboardId}`);
    socket.to(`dashboard:${dashboardId}`).emit('user:join', {
      socketId: socket.id,
      timestamp: new Date()
    });
  });

  socket.on('leave:dashboard', (dashboardId) => {
    socket.leave(`dashboard:${dashboardId}`);
    socket.to(`dashboard:${dashboardId}`).emit('user:leave', {
      socketId: socket.id,
      timestamp: new Date()
    });
  });

  socket.on('cursor:move', (data) => {
    socket.to(`dashboard:${data.dashboardId}`).emit('cursor:move', {
      socketId: socket.id,
      ...data
    });
  });

  socket.on('dashboard:update', (data) => {
    socket.to(`dashboard:${data.dashboardId}`).emit('dashboard:update', data);
  });

  socket.on('annotation:add', (data) => {
    socket.to(`dashboard:${data.dashboardId}`).emit('annotation:add', data);
  });

  socket.on('data:upload', (data) => {
    socket.to(`dashboard:${data.dashboardId}`).emit('data:upload', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});