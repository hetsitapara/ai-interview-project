const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const YesNoQuestion = require('../models/YesNoQuestion');

// @desc    Get Yes/No Questions (Paginated)
// @route   GET /api/yesno
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const count = await YesNoQuestion.countDocuments();
        const questions = await YesNoQuestion.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            questions,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Add Yes/No Question
// @route   POST /api/yesno
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { question, answer, category, difficulty } = req.body;
        const newQuestion = await YesNoQuestion.create({
            question, answer, category, difficulty
        });
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating question' });
    }
});

// @desc    Bulk Upload Yes/No Questions
// @route   POST /api/yesno/bulk
// @access  Private/Admin
router.post('/bulk', protect, admin, async (req, res) => {
    try {
        const questions = req.body;
        if (!Array.isArray(questions)) return res.status(400).json({ message: 'Input must be array' });
        await YesNoQuestion.insertMany(questions);
        res.status(201).json({ message: 'Questions added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error bulk uploading' });
    }
});

// @desc    Update Yes/No Question
// @route   PUT /api/yesno/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const question = await YesNoQuestion.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        Object.assign(question, req.body);
        await question.save();
        res.json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating' });
    }
});

// @desc    Delete Yes/No Question
// @route   DELETE /api/yesno/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await YesNoQuestion.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting' });
    }
});

// @desc    Delete All
// @route   DELETE /api/yesno/deleteAll
// @access  Private/Admin
router.delete('/deleteAll', protect, admin, async (req, res) => {
    try {
        await YesNoQuestion.deleteMany({});
        res.json({ message: 'All deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting all' });
    }
});

module.exports = router;
