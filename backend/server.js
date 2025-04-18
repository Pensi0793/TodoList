require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Dùng để xử lý đường dẫn tĩnh

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Serve static files từ React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route để trả về index.html cho React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Lắng nghe cổng từ .env hoặc mặc định 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
