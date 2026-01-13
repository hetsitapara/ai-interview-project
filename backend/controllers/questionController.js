const Question = require('../models/Question');

// @desc    Get all questions (with filters)
// @route   GET /api/questions
// @access  Private (or Public? Let's make it Private as only logged users might access the bank)
// @desc    Get all questions (with filters)
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res) => {
    try {
        const { topic, category, difficulty, search } = req.query;
        let query = {};

        if (topic) {
            const topics = topic.split(',');
            query.topic = { $in: topics };
        }

        if (category) {
            const categories = category.split(',');
            query.category = { $in: categories };
        }

        if (difficulty) {
            const levels = difficulty.split(',');
            query.difficulty = { $in: levels };
        }

        if (search) {
            // Use text search if available, otherwise regex fall back
            // For partial matches regex is often preferred by users, strictly text index requires full words usually.
            // Let's stick to regex for "contains" search behavior which users usually expect.
            // But user asked for indexing. We added index. We can use it if we want 'smart' search.
            // Let's use Regex on question and answer for broad matching.
            query.$or = [
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Question.countDocuments(query);
        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            questions,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all distinct categories
// @route   GET /api/questions/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const categories = await Question.distinct('category');
        res.json(categories.filter(c => c && c.trim() !== '')); // Remove empty categories
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private (ideally admin only, but for now any user)
const addQuestion = async (req, res) => {
    try {
        const { question, topic, category, difficulty, answer, source_type } = req.body;

        if (!question || !topic || !difficulty) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const newQuestion = await Question.create({
            question,
            topic,
            category,
            difficulty,
            answer,
            source_type
        });

        res.status(201).json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        await question.deleteOne();

        res.json({ message: 'Question removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk add questions
// @route   POST /api/questions/bulk
// @access  Private/Admin
const createQuestions = async (req, res) => {
    try {
        const questions = req.body; // Expecting an array of question objects

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of questions' });
        }

        // Optional: Validate each question object here if needed

        const createdQuestions = await Question.insertMany(questions);
        res.status(201).json(createdQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Delete all questions
// @route   DELETE /api/questions/deleteAll
// @access  Private/Admin
const deleteAllQuestions = async (req, res) => {
    try {
        await Question.deleteMany({});
        res.json({ message: 'All questions removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getQuestions,
    getCategories,
    addQuestion,
    createQuestions,
    updateQuestion,
    deleteQuestion,
    deleteAllQuestions
};
