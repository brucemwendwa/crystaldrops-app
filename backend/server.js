require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict to frontend URL
    methods: ['GET', 'POST', 'PUT']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Inject io into request object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (!uri) {
      console.log('No MONGO_URI found. Starting MongoDB Memory Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('MongoDB Memory Server started at:', uri);
    }
    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully');
    const { ensureAdminUser } = require('./ensureAdminUser');
    await ensureAdminUser();
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected via socket: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
