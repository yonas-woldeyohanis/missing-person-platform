// frontend/src/components/CommentSection.js
import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/auth/AuthContext';
import { toast } from 'react-toastify';
import CommentItem from './CommentItem'; // Import our new component
import './CommentSection.css';

function CommentSection({ reportId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/comments`);
      const data = await response.json();
      if (response.ok) setComments(data);
    } catch (error) { console.error("Failed to fetch comments", error); }
  };

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("You must be logged in to comment."); return; }
    if (newComment.trim() === '') return;

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ text: newComment }),
      });
      if (response.ok) {
        setNewComment('');
        setIsExpanded(true);
        fetchComments(); // Re-fetch all comments to show the new one
      } else { toast.error("Failed to post comment."); }
    } catch (error) { toast.error("An error occurred."); }
  };

  return (
    <div className="comment-section">
      {comments.length > 0 && !isExpanded && (
        <button className="view-comments-button" onClick={() => setIsExpanded(true)}>
          View all {comments.length} comments and replies
        </button>
      )}
      {isExpanded && (
        <>
          <div className="comment-list">
            {comments.map(comment => (
              <CommentItem key={comment._id} comment={comment} reportId={reportId} onActionSuccess={fetchComments} />
            ))}
          </div>
          <button className="view-comments-button" onClick={() => setIsExpanded(false)}>
            Hide comments
          </button>
        </>
      )}
      {user && (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <input type="text" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          <button type="submit">Post</button>
        </form>
      )}
    </div>
  );
}

export default CommentSection;