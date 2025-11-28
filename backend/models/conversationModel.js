const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    // RENAME 'participants' -> 'members' (To match the Controller logic)
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    // We REMOVED 'report' requirement.
    // In professional apps, a conversation is between "User A" and "User B".
    // They can talk about 5 different reports in one chat thread.

    // Add this for the Inbox Preview (Latest message text/time)
    lastMessage: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);
