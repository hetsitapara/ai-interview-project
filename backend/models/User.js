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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
