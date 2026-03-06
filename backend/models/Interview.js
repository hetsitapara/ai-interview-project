const mongoose = require('mongoose');

const interviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        default: 'Medium'
    },
    questions: [{
        questionId: {
            type: String, // Changed from ObjectId to support CSV-based string IDs
            required: true
        },
        questionText: String,
        userAnswer: String,
        idealAnswer: String,
        timeTaken: Number, // in seconds
        similarity_score: Number,
        keyword_score: Number,
        final_score: Number,
        feedback: String,
        aiOverview: {
            type: String,
            default: ''
        }
    }],
    overallScore: {
        type: Number,
        default: 0
    },
    overallFeedback: {
        type: String,
        default: ''
    },
    detailedReport: {
        type: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
