const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    // An array containing the IDs of the two users in the conversation
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // We will also store a reference to the report this conversation is about
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);
