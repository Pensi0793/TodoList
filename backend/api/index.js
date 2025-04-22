const express = require('express');
const authRoutes = require('../routes/auth');
const todoRoutes = require('../routes/todo');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

module.exports = app;