const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingQuestion',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Passed', 'Failed'],
    required: true,
  },
  passedCases: {
    type: Number,
    required: true,
  },
  totalCases: {
    type: Number,
    required: true,
  },
  results: [
    {
      input: String,
      expected: String,
      actual: String,
      passed: Boolean,
      error: String
    }
  ]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Submission', submissionSchema);
