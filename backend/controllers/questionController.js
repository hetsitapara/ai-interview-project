const Question = require('../models/Question');

// @desc    Get all questions (with filters)
// @route   GET /api/questions
// @access  Private (or Public? Let's make it Private as only logged users might access the bank)
const getQuestions = async (req, res) => {
    try {
        const { topic, difficulty, search } = req.query;
        let query = {};

        if (topic) {
            // Support comma separated topics or single topic
            const topics = topic.split(',');
            query.topic = { $in: topics };
        }

        if (difficulty) {
            const levels = difficulty.split(',');
            query.difficulty = { $in: levels };
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        const questions = await Question.find(query).sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private (ideally admin only, but for now any user)
const addQuestion = async (req, res) => {
    try {
        const { title, topic, difficulty, answer } = req.body;

        if (!title || !topic || !difficulty) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const question = await Question.create({
            title,
            topic,
            difficulty,
            answer
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

module.exports = {
    getQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion
};
