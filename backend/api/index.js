const express = require('express');
const corsMiddleware = require('../middleware/cors');
const authRoutes = require('../routes/auth');
const todoRoutes = require('../routes/todo');

const app = express();

// Sử dụng middleware CORS tùy chỉnh
app.use(corsMiddleware);

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

module.exports = app;