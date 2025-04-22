require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const app = require('./api/index'); // Import app từ api/index.js

// Log giá trị MONGO_URI để kiểm tra
console.log('MONGO_URI:', process.env.MONGO_URI);

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Cấu hình CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://todo-list-red-nine-46.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Cổng chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));