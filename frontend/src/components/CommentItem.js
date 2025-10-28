import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import AuthContext from '../context/auth/AuthContext';
import './CommentSection.css';

// --- HEART ICON COMPONENT ---
// A simple Heart Icon SVG that changes color based on the isLiked prop
const HeartIcon = ({ isLiked }) => (
  <svg
    className={`heart-icon ${isLiked ? 'liked' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

// --- MAIN COMMENT ITEM COMPONENT ---
// This is a recursive component. It renders itself for replies.
function CommentItem({ comment, reportId, onActionSuccess }) {
  // --- HOOKS & CONTEXT ---
  const { user } = useContext(AuthContext);

  // --- STATE MANAGEMENT ---
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Use a fallback to ensure comment.likes is never undefined
  const likes = comment.likes || [];
  const [isLiked, setIsLiked] = useState(() => user && likes.includes(user._id));
  const [likeCount, setLikeCount] = useState(likes.length);




const handleLikeComment = async () => {
    if (!user) {
        toast.error("You must be logged in to like a comment.");
        return;
    }
    
    // Store original state for potential rollback
    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    // Optimistic update for a fast UI
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
        const response = await fetch(`http://localhost:5000/api/reports/comments/${comment._id}/like`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${user.token}` },
        });

        if (!response.ok) {
            // If the server returns an error, revert the state
            throw new Error('Server failed to process the like.');
        }
        // --- THIS LINE HAS BEEN DELETED ---
        // onActionSuccess(); // DO NOT RE-FETCH HERE. Trust the optimistic update.

    } catch (error) {
        // If any error occurs, revert the UI back to its original state
        setIsLiked(originalIsLiked);
        setLikeCount(originalLikeCount);
        toast.error("Failed to update like status.");
    }
};

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/api/reports/comments/${comment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ text: editText }),
      });
      setIsEditing(false);
      onActionSuccess();
    } catch (error) { toast.error("Update failed."); }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await fetch(`http://localhost:5000/api/reports/comments/${commentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        onActionSuccess();
      } catch (error) { toast.error('Failed to delete comment.'); }
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (replyText.trim() === '') return;
    const replyingToName = comment.user?.name || 'user';
    const fullReplyText = `@${replyingToName} ${replyText}`;
    try {
      await fetch(`http://localhost:5000/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ text: fullReplyText, parentCommentId: comment._id }),
      });
      setReplyText('');
      setShowReplyForm(false);
      onActionSuccess();
    } catch (error) { toast.error("Failed to post reply."); }
  };

  // --- JSX / RENDER ---
  return (
    <div className="comment-thread">
      <div className="comment">
        <div className="comment-avatar-placeholder"></div>
        <div className="comment-content">
          {isEditing ? (
            <form onSubmit={handleUpdateComment} className="edit-comment-form">
              <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
              <button type="submit" className="edit-save-button">Save</button>
              <button type="button" className="edit-cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
          ) : (
            <>
              <div>
                <span className="commenter-name">{comment.user?.name || 'Anonymous'}</span>
                <p>{comment.text}</p>
              </div>
              {user && (user.isAdmin || user._id === comment.user?._id) && (
                <div className="comment-owner-buttons">
                  {user._id === comment.user?._id && <button className="edit-toggle-button" onClick={() => setIsEditing(true)}>Edit</button>}
                  <button onClick={() => handleDeleteComment(comment._id)} className="delete-comment-button">&times;</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="comment-actions">
        <span className="comment-timestamp">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
        {user && (
          <button className="action-button" onClick={handleLikeComment}>
            <HeartIcon isLiked={isLiked} />
          </button>
        )}
        {likeCount > 0 && <span className="like-count">{likeCount}</span>}
        {user && <button className="reply-button" onClick={() => setShowReplyForm(!showReplyForm)}>{showReplyForm ? 'Cancel' : 'Reply'}</button>}
      </div>

      {showReplyForm && (
        <form className="comment-form reply-form" onSubmit={handlePostReply}>
          <input type="text" placeholder={`Replying to ${comment.user?.name}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} autoFocus />
          <button type="submit">Post</button>
        </form>
      )}

      <div className="comment-replies">
        {comment.replies && comment.replies.map(reply => (
          <CommentItem key={reply._id} comment={reply} reportId={reportId} onActionSuccess={onActionSuccess} />
        ))}
      </div>
    </div>
  );
}

export default CommentItem;