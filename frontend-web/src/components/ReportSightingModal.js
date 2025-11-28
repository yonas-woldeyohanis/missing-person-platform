import './ReportSightingModal.css';
import { motion, AnimatePresence } from 'framer-motion';

// The component accepts 'isOpen' to control its visibility and 'onClose' to close it
function ReportSightingModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content"
            initial={{ y: "-100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <h2>Report a Sighting</h2>
            <p>If you have any information, please fill out the form below. Your help is greatly appreciated.</p>
            <form className="sighting-form">
              <input type="text" placeholder="Your Name" required />
              <input type="text" placeholder="Your Phone or Email" required />
              <textarea placeholder="Please provide details of the sighting (location, date, time, etc.)..." rows="4" required></textarea>
              <div className="modal-actions">
                <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="button-primary">Submit Report</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReportSightingModal;