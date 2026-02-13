const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctOptions: [{
        type: Number, // Storing indices (0-3) is usually safer than strings for exact matching logic
        required: true
    }],
    type: {
        type: String,
        enum: ['MCQ', 'MSQ'],
        default: 'MCQ'
    },
    category: {
        type: String,
        required: true,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('McqQuestion', mcqQuestionSchema);
