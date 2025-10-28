const Conversation = require('../models/conversationModel');
const Report = require('../models/reportModel');
const Message = require('../models/messageModel')

// @desc    Start a new conversation or get an existing one
// @route   POST /api/conversations
// @access  Private
const startConversation = async (req, res) => {
  // The person starting the chat is the logged-in user (req.user.id)
  // The other participant is the user who created the report (report.user)
  const { reportId } = req.body;

  try {
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const posterId = report.user.toString();
    const inquirerId = req.user.id;

    // Prevent a user from starting a conversation with themselves
    if (posterId === inquirerId) {
        return res.status(400).json({ message: 'You cannot start a chat about your own report.' });
    }

    // Check if a conversation between these two users about this report already exists
    let conversation = await Conversation.findOne({
      report: reportId,
      participants: { $all: [posterId, inquirerId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = await Conversation.create({
        report: reportId,
        participants: [posterId, inquirerId],
      });
    }

    // Send back the conversation ID
    res.status(200).json(conversation);

  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// We will also need a way to get all of a user's conversations for their "Inbox"
// @desc    Get all conversations for a user
// @route   GET /api/conversations
// @access  Private
const getUserConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user.id })
            .populate('participants', 'name') // Get the name of the participants
            .populate('report', 'name'); // Get the name from the report
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
// @desc    Get all messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
// In conversationController.js

const getMessagesForConversation = async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id })
            .populate('sender', 'name')
            .sort({ createdAt: 'asc' });

        // --- THIS IS THE CRUCIAL DEBUG LOG ---
        console.log(`Found ${messages.length} historical messages for convo ${req.params.id}.`);
        // Let's check the content of the last message to see if imageUrl is there
        if (messages.length > 0) {
            console.log('Last message content:', messages[messages.length - 1]);
        }
        // ----------------------------------------

        res.json(messages);
    } catch (error) {
        console.error("FETCH MESSAGES ERROR:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
  startConversation,
  getUserConversations,
  getMessagesForConversation,
};