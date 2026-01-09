const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a question title']
    },
    topic: {
        type: String,
        required: [true, 'Please add a topic'],
        enum: ['DSA', 'DBMS', 'OS', 'HR', 'Other'] // Enforce consistent topics
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
    tags: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
