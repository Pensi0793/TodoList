require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();

// Middleware đọc JSON body
app.use(express.json());

// Cấu hình CORS cho frontend trên Vercel
const allowedOrigins = [
  'http://localhost:3000',
  'https://todo-list-red-nine-46.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Cổng chạy server - dùng biến môi trường hoặc mặc định 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
