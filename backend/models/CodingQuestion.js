const mongoose = require('mongoose');

const codingQuestionSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  tags: {
    type: [String],
    default: [],
  },
  inputFormat: String,
  outputFormat: String,
  constraints: String,
  examples: [
    {
      input: String,
      output: String,
      explanation: String,
    }
  ],
  testCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      isPublic: { type: Boolean, default: false } // If true, shown to user. If false, hidden.
    }
  ],
  starterCode: {
    javascript: { type: String, default: "// Write your code here" },
    python: { type: String, default: "# Write your code here" },
    c: { type: String, default: "// Write your code here" },
    cpp: { type: String, default: "// Write your code here" },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CodingQuestion', codingQuestionSchema);
