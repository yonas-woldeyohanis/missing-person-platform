import './ReportDetailPage.css';
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReportSightingModal from '../components/ReportSightingModal';
import AuthContext from '../context/auth/AuthContext';
import { motion } from 'framer-motion';
import MapView from '../components/MapView';

function ReportDetailPage() {
  // --- STATE MANAGEMENT ---
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- HOOKS ---
  const { id } = useParams(); // Gets the report ID from the URL
  const { user } = useContext(AuthContext); // Gets the current logged-in user
  const navigate = useNavigate(); // For redirecting the user

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/reports/${id}`);
        const data = await response.json();
        if (response.ok) {
          setReportData(data);
        } else {
          setReportData(null); // Explicitly set to null on error
        }
      } catch (error) {
        console.error("Failed to fetch report:", error);
      }
      setLoading(false);
    };

    fetchReport();
  }, [id]); // Re-fetch if the ID in the URL changes

  // --- HANDLER FUNCTIONS ---
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleStartConversation = async () => {
    if (!user) {
      alert('You must be logged in to send a message.');
      navigate('/login');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ reportId: id }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate(`/chat/${data._id}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  // --- RENDER LOGIC ---

  if (loading) {
    return (
      <div className="detail-page"><Navbar /><div className="loading-state"><h1>Loading...</h1></div></div>
    );
  }

  if (!reportData) {
    return (
      <div className="detail-page"><Navbar /><div className="not-found"><h1>Report Not Found</h1></div></div>
    );
  }

  return (
    <>
      <div className="detail-page">
        <Navbar />
        <motion.div
          className="detail-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="detail-card">
            <motion.img
              src={reportData.photoUrl}
              alt={`Photo of ${reportData.name}`}
              className="detail-photo"
              layoutId={`report-photo-${id}`}
            />
            <div className="detail-info">
              <h1 className="detail-name">{reportData.name}, {reportData.age}</h1>
              <p className="detail-last-seen"><strong>Last Seen:</strong> {reportData.lastSeen}</p>
              <div className="map-container">
  <MapView 
  lat={reportData.latitude}  
  lon={reportData.longitude} 
  locationName={reportData.lastSeen}
  />
</div>
              <p className="detail-description">{reportData.description}</p>
              <p className="detail-contact"><strong>Contact:</strong> {reportData.contactInfo}</p>
              
              {/* This is the conditional button logic */}
              {user && reportData.user && user._id === reportData.user._id ? (
                <p className="own-post-notice">This is your report.</p>
              ) : user ? (
                <button className="report-sighting-button" onClick={handleStartConversation}>Message Poster</button>
              ) : (
                <button className="report-sighting-button" onClick={openModal}>Report a Sighting</button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <ReportSightingModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

export default ReportDetailPage;