import { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Navbar from '../components/Navbar';
import AuthContext from '../context/auth/AuthContext';
import './ChatPage.css';
import { toast } from 'react-toastify';


const socket = io.connect('http://localhost:5000');

function ChatPage() {
  const { id: conversationId } = useParams();
  const { user } = useContext(AuthContext);
  const [fileToSend, setFileToSend] = useState(null);

  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const chatBodyRef = useRef(null); // Ref to auto-scroll
const handleFileChange = (e) => {
  setFileToSend(e.target.files[0]);
};
  // --- Fetch initial messages when the component loads ---
  useEffect(() => {
    const fetchMessages = async () => {
      if (user?.token) {
        const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}/messages`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await response.json();
        setMessageList(data);
      }
    };
    fetchMessages();
  }, [conversationId, user]);

  // --- Handle real-time connection and receiving new messages ---
  useEffect(() => {
    socket.emit('join_room', conversationId);

    const receiveMessageHandler = (data) => {
      
    };
    socket.on('receive_message', receiveMessageHandler);

    return () => socket.off('receive_message', receiveMessageHandler);
  }, [conversationId]);
  
  // --- Auto-scroll to the bottom when new messages arrive ---
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messageList]);

 // In ChatPage.js, replace the entire sendMessage function

const sendMessage = async () => {
  // Prevent sending empty messages
  if (currentMessage.trim() === '' && !fileToSend) {
    return;
  }

  let imageUrl = null;

  // Step 1: If there's a file, upload it first
  if (fileToSend) {
    const formData = new FormData();
    formData.append('image', fileToSend);
    try {
      const res = await fetch('http://localhost:5000/api/reports/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await res.json();
      if (uploadData.success) {
        imageUrl = uploadData.data.secure_url; // Get the URL from Cloudinary
      } else {
         toast.error('Image upload failed.');
        return;
      }
    } catch (error) {
      console.error("File upload failed:", error);
       toast.error('File upload failed.');
      return;
    }
  }

  // Step 2: Create the message data object
  const messageData = {
    conversationId: conversationId,
    senderId: user._id,
    text: currentMessage,
    imageUrl: imageUrl, // Include the image URL if it exists
  };

  // Step 3: Emit the message via socket
  await socket.emit('send_message', messageData);

  // Step 4: Update our own UI instantly
  setMessageList((list) => [...list, { ...messageData, sender: { name: user.name }, createdAt: new Date().toISOString() }]);
  setCurrentMessage('');
  setFileToSend(null);
};

  return (
    <div className="chat-page-container">
      <Navbar />
      <div className="chat-window">
        <div className="chat-header"><p>Live Chat</p></div>
        <div className="chat-body" ref={chatBodyRef}>
          {messageList.map((messageContent, index) => {
            const isYou = user._id === messageContent.sender._id;
            return (
              <div key={index} className={`message ${isYou ? 'you' : 'other'}`}>
<div className="message-content">
  {/* Render the image if the URL exists */}
  {messageContent.imageUrl && (
    <img src={messageContent.imageUrl} alt="chat attachment" className="chat-image" />
  )}
  {/* Render the text if it exists */}
  {messageContent.text && <p>{messageContent.text}</p>}
</div>                <div className="message-meta">
                  <p>{new Date(messageContent.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p>{isYou ? 'You' : messageContent.sender.name}</p>
                </div>
              </div>
            );
          })}
        </div>
       <div className="chat-footer">
  {/* File upload button */}
  <label htmlFor="file-input" className="file-upload-button">📎</label>
  <input id="file-input" type="file" onChange={handleFileChange} style={{ display: 'none' }} />
  
  <input
    type="text"
    value={currentMessage}
    placeholder={fileToSend ? fileToSend.name : "Type a message..."} // Show file name
    onChange={(e) => setCurrentMessage(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
  />
  <button onClick={sendMessage}>&#9658;</button>
</div>
      </div>
    </div>
  );
}
export default ChatPage;