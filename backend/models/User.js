const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        default: 'user'
    },
    skills: {
        type: [String],
        default: []
    },
    careerGoals: {
        type: String,
        default: ''
    },
    socialLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' }
    },
    avatar: {
        type: String,
        default: '' // URL to avatar image
    },
    stats: {
        streak: { type: Number, default: 0 },
        lastActiveDate: { type: Date, default: null },
        activityLog: [{
            date: { type: String }, // ISO Date string YYYY-MM-DD
            count: { type: Number, default: 1 }
        }],
        totalScore: { type: Number, default: 0 }, // Cumulative score from all quizzes/interviews
        quizzesTaken: { type: Number, default: 0 }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
