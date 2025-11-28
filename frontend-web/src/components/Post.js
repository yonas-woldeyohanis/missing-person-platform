import "./Post.css";
import { motion } from "framer-motion";
import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/auth/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import CommentSection from "./CommentSection";
// A simple Heart Icon SVG
const HeartIcon = ({ isLiked }) => (
  <svg
    className={`heart-icon ${isLiked ? "liked" : ""}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

// A simple Share Icon SVG
const ShareIcon = () => (
  <svg
    className="share-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

// --- START: MODIFIED FUNCTION SIGNATURE ---
function Post({
  id,
  missingPersonName, // Renamed from 'name'
  age,
  lastSeen,
  photoUrl,
  description,
  contactInfo,
  likes,
  poster, // New prop for the user object who posted
  isOwner = false,
  onEdit,
  onDelete,
}) {
  // --- END: MODIFIED FUNCTION SIGNATURE ---

  const { user } = useContext(AuthContext);

  const [likeCount, setLikeCount] = useState(likes.length);
  const [isLiked, setIsLiked] = useState(() => {
    if (!user || !likes) return false;
    return likes.includes(user._id);
  });

  // This useEffect is redundant if the useState initializer is correct, but it's safe to keep.
  useEffect(() => {
    if (user && likes.includes(user._id)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [user, likes]);

  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like a post.");
      return;
    }
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    try {
      await fetch(`http://localhost:5000/api/reports/${id}/like`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch (error) {
      console.error("Failed to like post:", error);
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Missing Person Report: ${missingPersonName}`,
      text: `Please help find ${missingPersonName}, age ${age}, last seen in ${lastSeen}. ${description}`,
      url: window.location.origin + `/report/${id}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast("Link copied to clipboard!");
      } catch (err) {
        toast("Could not copy link.");
      }
    }
  };

  // --- START: MODIFIED RETURN STATEMENT ---
  return (
    <motion.div
      className="post-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="post-header">
        {/* The Link now wraps both the avatar and the name */}
        <Link to={`/profile/${poster?._id}`} className="poster-info-link">
          <div className="poster-info">
            <div className="poster-avatar-placeholder"></div>
            <span className="poster-name">{poster?.name || "Anonymous"}</span>
          </div>
        </Link>

        {isOwner && (
          <div className="post-owner-actions">
            <button onClick={onEdit} className="edit-button">
              Edit
            </button>
            <button onClick={onDelete} className="delete-button">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main image links to the detail page */}
      <Link to={`/report/${id}`}>
        <img
          src={photoUrl}
          alt={`Photo of ${missingPersonName}`}
          className="post-image"
        />
      </Link>

      {/* Action buttons (Like, Share) */}
      <div className="post-actions">
        <button className="action-button" onClick={handleLike}>
          <HeartIcon isLiked={isLiked} />
        </button>
        <button className="action-button" onClick={handleShare}>
          <ShareIcon />
        </button>
      </div>

      {/* Main content of the post */}
      <div className="post-content">
        {likeCount > 0 && (
          <p className="like-counter">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </p>
        )}
        <p className="post-details">
          <strong>Missing:</strong> {missingPersonName} | <strong>Age:</strong>{" "}
          {age} | <strong>Last Seen:</strong> {lastSeen}
        </p>
        <p className="post-description">{description}</p>
        <p className="post-contact">
          <strong>Contact:</strong> {contactInfo}
        </p>
      </div>
      <CommentSection reportId={id} />
    </motion.div>
  );
  // --- END: MODIFIED RETURN STATEMENT ---
}

export default Post;
