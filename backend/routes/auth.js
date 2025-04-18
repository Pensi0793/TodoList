const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Kiểm tra xem username đã tồn tại chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: 'Username already exists' });
        }

        // Nếu không trùng, tạo user mới
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;