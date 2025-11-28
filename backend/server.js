const dotenv = require('dotenv');
dotenv.config();

// --- DEPENDENCY IMPORTS ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http'); // Node.js native HTTP module
const { Server } = require("socket.io"); // Socket.IO Server class
const Message = require('./models/messageModel');
// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
connectDB();


// --- SERVER & APP SETUP ---
const app = express();
const server = http.createServer(app); // Create an HTTP server from our Express app

// Initialize Socket.IO and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow our React app to connect
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;


// --- MIDDLEWARES ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// --- API ROUTES ---
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes')); 



// --- SOCKET.IO CONNECTION HANDLING ---


io.on('connection', (socket) => {
  console.log(`✅ User Connected: ${socket.id}`);

  // When a user joins a specific chat room
  socket.on('join_room', (conversationId) => {
    socket.join(conversationId);
    console.log(`User [${socket.id}] joined room [${conversationId}]`);
  });

  // When a user sends a message

socket.on('send_message', async (data) => {
  // --- POWERFUL DEBUG LOGGING ---
  console.log("--- Server received 'send_message' event ---");
  console.log("Received data object:", data);
  console.log("Does it have an imageUrl?", data.imageUrl);
  // --------------------------------

  try {
    // Create the object to save, explicitly checking for the imageUrl
    const messageToSave = {
      conversationId: data.conversationId,
      sender: data.senderId,
      text: data.text || '', // Default to empty string if text is missing
    };
    
    // --- THIS IS THE CRUCIAL FIX ---
    // Only add the imageUrl field to our database object if it actually exists
    if (data.imageUrl) {
      messageToSave.imageUrl = data.imageUrl;
    }
    // --------------------------------

    const newMessage = await Message.create(messageToSave);
    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name');
    
    // Log what we are about to send back
    console.log("Broadcasting populated message:", populatedMessage);
    
    io.in(data.conversationId).emit('receive_message', populatedMessage);

  } catch (error) {
    console.error('Socket message save error:', error);
  }
});

  socket.on('disconnect', () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
  });
});


// --- START THE SERVER ---
// We listen on the 'server' instance, which now includes both Express and Socket.IO
server.listen(PORT, () => {
  console.log(`🚀 Server is running successfully on port ${PORT}`);
});