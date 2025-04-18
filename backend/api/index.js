require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('../routes/auth');
const todoRoutes = require('../routes/todo');

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

module.exports = app;