const Conversation = require("../models/conversationModel");
const Report = require("../models/reportModel");
const User = require("../models/userModel");

// --- 1. START OR GET EXISTING CONVERSATION ---
const startConversation = async (req, res) => {
  console.log("📥 [BACKEND] Start Conversation Request Received");
  const { reportId } = req.body;

  if (!reportId) {
    return res.status(400).json({ message: "Report ID is required" });
  }

  try {
    const report = await Report.findById(reportId);
    if (!report) {
      console.log("❌ Report not found");
      return res.status(404).json({ message: "Report not found" });
    }

    // SAFE ID EXTRACTION (Fixes object vs string issues)
    const senderId = req.user._id.toString();
    const receiverId = (report.user._id || report.user).toString(); // Handle populated or raw ID

    console.log(`Checking chat between: ${senderId} and ${receiverId}`);

    // Prevent chatting with yourself
    if (senderId === receiverId) {
      console.log("⚠️ User tried to chat with self");
      return res
        .status(400)
        .json({ message: "You cannot chat with yourself." });
    }

    // Check if conversation exists (Order doesn't matter with $all)
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (conversation) {
      console.log("✅ Found existing conversation:", conversation._id);
      return res.status(200).json(conversation);
    }

    // Create New
    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });

    const savedConversation = await newConversation.save();
    console.log("🎉 Created NEW conversation:", savedConversation._id);
    res.status(200).json(savedConversation);
  } catch (error) {
    console.error("🔥 Create Conversation Error:", error);
    res.status(500).json(error);
  }
};

// --- 2. GET USER CONVERSATIONS ---
const getUserConversations = async (req, res) => {
  try {
    // 1. Find conversations
    const conversations = await Conversation.find({
      members: { $in: [req.user._id] },
    })
      .populate("members", "name email username") // Get real names
      .sort({ updatedAt: -1 });

    // 2. Filter out corrupt data (where members might be null)
    const validConversations = conversations.filter(
      (c) => c.members && c.members.length === 2 && c.members[0] && c.members[1]
    );

    res.status(200).json(validConversations);
  } catch (error) {
    console.error("Inbox Fetch Error:", error);
    res.status(500).json(error);
  }
};

// --- 3. GET MESSAGES ---
const Message = require("../models/messageModel");

const getMessagesForConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id,
    })
      .populate("sender", "name email username")
      .sort({ createdAt: -1 }); // Important for GiftedChat

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  startConversation,
  getUserConversations,
  getMessagesForConversation,
};
