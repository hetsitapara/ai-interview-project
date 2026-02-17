const Question = require('../models/Question');

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
        const categories = await Question.find().distinct('category');
        res.json(categories.filter(c => c && c.trim() !== '')); // Remove empty categories
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get distinct topics/subtopics for a specific category (or multiple)
// @route   GET /api/questions/:category/topics
// @access  Private
const getTopicsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        let query = {};

        if (category && category !== 'Random') {
            if (category.includes(',')) {
                const categories = category.split(',').map(c => c.trim());
                query.category = { $in: categories };
            } else {
                query.category = category;
            }
        }

        const topics = await Question.find(query).distinct('topic');
        res.json(topics.filter(t => t && t.trim() !== ''));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private/Admin
const addQuestion = async (req, res) => {
    try {
        const { question, topic, category, difficulty, answer, source_type } = req.body;

        if (!question || !topic || !difficulty) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const newQuestion = await Question.create({
            question,
            topic, // This acts as the "subtopic"
            category,
            difficulty,
            answer,
            source_type
        });

        res.status(201).json(newQuestion);
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
    getTopicsByCategory,
    addQuestion,
    createQuestions,
    updateQuestion,
    deleteQuestion,
    deleteAllQuestions
};
