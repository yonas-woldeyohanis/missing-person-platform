import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/auth/AuthContext';
import { Link } from 'react-router-dom';
import './InboxView.css';

function InboxView() {
  const [conversations, setConversations] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.token) return;
      try {
        const response = await fetch('http://localhost:5000/api/conversations', {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setConversations(data);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };
    fetchConversations();
  }, [user]);

  return (
    <div className="inbox-container">
      {conversations.length > 0 ? (
        conversations.map(convo => (
  <Link to={`/chat/${convo._id}`} key={convo._id} className="conversation-link">
    <div className="conversation-item">
      <div className="convo-avatar-placeholder"></div>
      <div className="convo-details">
        <div className="convo-participant-name">
          {convo.participants.find(p => p._id !== user._id)?.name || 'Unknown User'}
        </div>
        <div className="convo-report-title">
          Regarding: {convo.report?.name || 'Deleted Report'}
        </div>
      </div>
    </div>
  </Link>
))
      ) : (
        <p className="no-messages-text">You have no messages yet.</p>
      )}
    </div>
  );
}
export default InboxView;