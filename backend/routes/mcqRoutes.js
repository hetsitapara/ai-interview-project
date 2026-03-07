const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
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
        
        if (category && category !== 'Random') {
             if (category.includes(',')) {
                 const categories = category.split(',').map(c => c.trim());
                 matchStage.category = { $in: categories };
             } else {
                 matchStage.category = { $regex: new RegExp(category, 'i') };
             }
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
const User = require('../models/User'); // Import User model

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

        // --- GAMIFICATION UPDATE START ---
        const user = await User.findById(req.user._id);
        const today = new Date().toISOString().split('T')[0];
        
        let shouldIncrementStreak = false;
        if (user.stats.lastActiveDate) {
             const lastDate = new Date(user.stats.lastActiveDate).toISOString().split('T')[0];
             const diffTime = Math.abs(new Date(today) - new Date(lastDate));
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             
             if (diffDays === 1) {
                 shouldIncrementStreak = true;
             } else if (diffDays > 1) {
                 user.stats.streak = 0; // Reset streak if missed a day
                 shouldIncrementStreak = true; // Start new streak
             }
        } else {
             shouldIncrementStreak = true; // First time
        }

        if (shouldIncrementStreak && user.stats.lastActiveDate?.toISOString().split('T')[0] !== today) {
            user.stats.streak = (user.stats.streak || 0) + 1;
        }

        user.stats.lastActiveDate = new Date();
        user.stats.quizzesTaken = (user.stats.quizzesTaken || 0) + 1;
        user.stats.totalScore = (user.stats.totalScore || 0) + totalScore;
        
        // Update Activity Log
        const logIndex = user.stats.activityLog.findIndex(l => l.date === today);
        if (logIndex > -1) {
            user.stats.activityLog[logIndex].count += 1;
        } else {
            user.stats.activityLog.push({ date: today, count: 1 });
        }
        
        await user.save();
        // --- GAMIFICATION UPDATE END ---

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

// ... existing endpoints ...

// @desc    Add single MCQ
// @route   POST /api/mcq
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { question, options, correctOptions, type, category } = req.body;
        const newQuestion = await McqQuestion.create({
            question, options, correctOptions, type, category
        });
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating question' });
    }
});

// @desc    Bulk Upload MCQs
// @route   POST /api/mcq/bulk
// @access  Private/Admin
router.post('/bulk', protect, admin, async (req, res) => {
    try {
        const questions = req.body;
        if (!Array.isArray(questions)) {
            return res.status(400).json({ message: 'Input must be an array' });
        }
        await McqQuestion.insertMany(questions);
        res.status(201).json({ message: 'Questions added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error bulk uploading' });
    }
});

// @desc    Update MCQ
// @route   PUT /api/mcq/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const question = await McqQuestion.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        
        Object.assign(question, req.body);
        await question.save();
        res.json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating question' });
    }
});

// @desc    Delete MCQ
// @route   DELETE /api/mcq/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const question = await McqQuestion.findByIdAndDelete(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        res.json({ message: 'Question removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting question' });
    }
});

// @desc    Delete All MCQs
// @route   DELETE /api/mcq/deleteAll
// @access  Private/Admin
router.delete('/deleteAll', protect, admin, async (req, res) => {
    try {
        await McqQuestion.deleteMany({});
        res.json({ message: 'All questions deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting all questions' });
    }
});

// @desc    Get All MCQs (Paginated for Admin)
// @route   GET /api/mcq/all
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const count = await McqQuestion.countDocuments();
        const questions = await McqQuestion.find()
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
        res.status(500).json({ message: 'Error fetching questions' });
    }
});

module.exports = router;
