const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    startConversation,
    getUserConversations,getMessagesForConversation 
} = require('../controllers/conversationController');

// Route to get all of the logged-in user's conversations
router.route('/').get(protect, getUserConversations);

// Route to start a new conversation
router.route('/').post(protect, startConversation);
router.route('/:id/messages').get(protect, getMessagesForConversation);

module.exports = router;