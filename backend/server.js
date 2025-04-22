require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');

// Log giá trị MONGO_URI để kiểm tra
console.log('MONGO_URI:', process.env.MONGO_URI);

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();

app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'https://todo-list-red-nine-46.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));