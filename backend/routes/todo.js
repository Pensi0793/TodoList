const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Todo = require('../models/Todo'); // Đường dẫn đã đúng

// Middleware xác thực
const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', ''); // Xử lý token từ header
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

router.get('/', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user.id });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const todo = new Todo({ userId: req.user.id, title: req.body.title });
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!todo) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        res.json({ msg: 'Deleted' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { completed: req.body.completed },
            { new: true }
        );
        if (!todo) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;