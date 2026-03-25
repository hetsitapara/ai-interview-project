const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Please add a question']
    },
    topic: {
        type: String,
        required: [true, 'Please add a topic']
    },
    category: {
        type: String,
        default: 'General'
    },
    difficulty: {
        type: String,
        required: [true, 'Please add a difficulty level'],
        enum: ['Easy', 'Medium', 'Hard']
    },
    answer: {
        type: String,
        default: ''
    },
    source_type: {
        type: String,
        default: 'Technical'
    },
    tags: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Add text index for search optimization
questionSchema.index({ question: 'text', answer: 'text', category: 'text', topic: 'text' });
// Add field specific indexes
questionSchema.index({ category: 1 });
questionSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
