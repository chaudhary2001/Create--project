const express = require('express');

const Todo = require('../models/Todo');

const router = express.Router();

router.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        return res.status(200).json({
            message: 'Todos retrieved successfully',
            todos
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

router.post('/submittodoitem', async (req, res) => {
    try {
        const { itemName, itemDescription } = req.body || {};

        if (!itemName || String(itemName).trim() === '') {
            return res.status(400).json({ message: 'itemName is required' });
        }

        const todo = await Todo.create({
            itemName: String(itemName).trim(),
            itemDescription: itemDescription ? String(itemDescription).trim() : ''
        });

        return res.status(201).json({
            message: 'Todo item stored successfully',
            todo
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

router.put('/done/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const todo = await Todo.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true }
        );

        if (!todo) {
            return res.status(404).json({ message: 'Todo item not found' });
        }

        return res.status(200).json({
            message: 'Todo item marked as done',
            todo
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const todo = await Todo.findByIdAndDelete(id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo item not found' });
        }

        return res.status(200).json({
            message: 'Todo item deleted successfully'
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
