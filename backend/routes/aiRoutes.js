const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateStudyPlan, generateModelAnswer } = require('../services/aiService');

// @desc  Generate a personalized 5-day study plan based on weak areas
// @route POST /api/ai/study-plan
// @access Private
router.post('/study-plan', protect, async (req, res) => {
    try {
        const { weakAreas, level } = req.body;
        if (!weakAreas || weakAreas.length === 0) {
            return res.status(400).json({ message: 'weakAreas array is required' });
        }
        const plan = await generateStudyPlan(weakAreas, level || 'intermediate');
        res.json({ success: true, plan });
    } catch (err) {
        console.error('Study plan error:', err);
        res.status(500).json({ message: 'Failed to generate study plan' });
    }
});

// @desc  Generate a model answer for a given question
// @route POST /api/ai/model-answer
// @access Private
router.post('/model-answer', protect, async (req, res) => {
    try {
        const { question, idealAnswer } = req.body;
        if (!question) {
            return res.status(400).json({ message: 'question is required' });
        }
        const answer = await generateModelAnswer(question, idealAnswer || '');
        res.json({ success: true, answer });
    } catch (err) {
        console.error('Model answer error:', err);
        res.status(500).json({ message: 'Failed to generate model answer' });
    }
});

module.exports = router;
