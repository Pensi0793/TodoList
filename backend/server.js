require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./api/index'); // Import app từ api/index.js

// Log giá trị MONGO_URI để kiểm tra
console.log('MONGO_URI:', process.env.MONGO_URI);

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Cổng chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));