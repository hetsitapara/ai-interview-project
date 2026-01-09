const mongoose = require('mongoose');

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    author: {
      type: String, 
      required: true,
    },
    tag: {
      type: String,
      required: false, // Optional
      default: 'General'
    },
    // Add other fields as needed
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Blog', blogSchema);
