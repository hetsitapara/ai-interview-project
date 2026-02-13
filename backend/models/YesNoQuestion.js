const mongoose = require('mongoose');

const YesNoQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String, // "Yes" or "No"
    required: true,
    enum: ['Yes', 'No']
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    default: 'Easy'
  }
}, { timestamps: true });

module.exports = mongoose.model('YesNoQuestion', YesNoQuestionSchema);
