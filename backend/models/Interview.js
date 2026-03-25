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
    topic: {
        type: String,
        default: ''
    },
    difficulty: {
        type: String,
        default: 'Medium'
    },
    resumeAnalysis: {
        type: Object,
        default: null
    },
    questions: [{
        questionId: {
            type: String,
            required: true
        },
        questionText: String,
        category: String,
        topic: String,
        userAnswer: String,
        idealAnswer: String,
        timeTaken: Number,           // in seconds
        similarity_score: Number,
        accuracy_score: Number,      // 0–1, from AI
        confidence_score: Number,    // 0–1, from ML
        keyword_score: Number,       // 0–1, from AI
        final_score: Number,
        feedback: String,
        explanation: String,         // AI rationale text
        evaluation: String,          // Excellent / Good / Partial / Poor
        grammar_issues: [String],
        cheating_flag: Boolean,
        aiOverview: {
            type: String,
            default: ''
        },
        aiAdvice: {
            type: String,
            default: ''
        },
        aiImprovedAnswer: {
            type: String,
            default: ''
        },
        refinedAnswer: {
            type: String,
            default: ''
        },
        evaluationType: {
            type: String,
            enum: ['correct', 'partial', 'incorrect', 'unknown', 'error', ''],
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
