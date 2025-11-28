import './ReportCard.css';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Import Link

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Add the "id" prop so we know where to link to
function ReportCard({ id, name, age, lastSeen, photoUrl, gradient }) {
  return (
    // Wrap everything in a Link
    <Link to={`/report/${id}`} className="card-link">
      <motion.div
        className="report-card"
        variants={cardVariants}
        whileHover={{ scale: 1.03, y: -8 }}
        transition={{ duration: 0.2 }}
        style={{ '--hover-gradient': gradient }}
        layoutId={`report-photo-${id}`} // Unique ID for animation
      >
        <img src={photoUrl} alt={`Photo of ${name}`} className="card-photo" />
        <div className="card-info">
          <h3 className="card-name">{name}, {age}</h3>
          <p className="card-last-seen">Last seen: {lastSeen}</p>
        </div>
      </motion.div>
    </Link>
  );
}

export default ReportCard;