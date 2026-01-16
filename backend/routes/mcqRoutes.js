const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const McqQuestion = require('../models/McqQuestion');

// @desc    Start MCQ Practice
// @route   POST /api/mcq/start
// @access  Private
router.post('/start', protect, async (req, res) => {
    try {
        const { category, count = 5 } = req.body;
        console.log("MCQ HIT:", req.body); // DEBUG
        const limit = Math.max(5, parseInt(count));

        const matchStage = {};
        if (category) {
            matchStage.category = { $regex: new RegExp(category, 'i') };
        }

        const questions = await McqQuestion.aggregate([
            { $match: matchStage },
            { $sample: { size: limit } }
        ]);

        // Hide correct answers from frontend
        const questionsForFrontend = questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options,
            type: q.type,
            category: q.category
        }));

        res.json(questionsForFrontend);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching MCQs' });
    }
});

// @desc    Get all distinct categories
// @route   GET /api/mcq/categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
    try {
        const categories = await McqQuestion.distinct('category');
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching categories' });
    }
});

// @desc    Submit MCQ Answers
// @route   POST /api/mcq/submit
// @access  Private
router.post('/submit', protect, async (req, res) => {
    try {
        const { answers } = req.body;
        // answers: [{ questionId, selectedOptions: [indices] }]

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid answers format' });
        }

        let totalScore = 0;
        let correctCount = 0;
        const results = [];

        for (const ans of answers) {
            const question = await McqQuestion.findById(ans.questionId);
            if (!question) continue;

            const selected = ans.selectedOptions.sort((a, b) => a - b); // Sort for comparison
            const correct = question.correctOptions.sort((a, b) => a - b);

            // Check exact match
            const isCorrect = JSON.stringify(selected) === JSON.stringify(correct);

            if (isCorrect) {
                totalScore += 1; // 1 point per question
                correctCount++;
            }

            results.push({
                questionId: question._id,
                questionText: question.question,
                isCorrect,
                userSelected: selected,
                correctOptions: correct,
                options: question.options,
                explanation: `Correct option(s): ${correct.map(i => question.options[i]).join(', ')}`
            });
        }

        res.json({
            totalQuestions: answers.length,
            correctCount,
            score: totalScore,
            results // Send back detailed results so user can see what they got wrong
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error calculating result' });
    }
});

module.exports = router;
