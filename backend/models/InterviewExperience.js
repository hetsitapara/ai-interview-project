const mongoose = require('mongoose');

const InterviewExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true, // Easy, Medium, Hard
    enum: ['Easy', 'Medium', 'Hard']
  },
  desc: {
    type: String,
    required: true,
  },
  topics: {
    type: [String],
    default: []
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('InterviewExperience', InterviewExperienceSchema);
