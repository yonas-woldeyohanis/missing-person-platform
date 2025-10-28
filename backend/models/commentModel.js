const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Report',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    text: {
      type: String,
      required: [true, 'Please add some text to your comment'],
    },
    // --- THIS IS THE CRITICAL MISSING PIECE ---
    likes: {
      type: [mongoose.Schema.Types.ObjectId], // Defines an array of User IDs
      ref: 'User',
      default: [], // Defaults to an empty array
    },
    // -----------------------------------------
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', commentSchema);