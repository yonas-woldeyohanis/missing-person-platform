import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "../components/Navbar";
import Post from "../components/Post";
import InboxView from '../components/InboxView';
import AuthContext from "../context/auth/AuthContext";
import "./FeedPage.css"; // We reuse the feed page styles
import { toast } from 'react-toastify';

function ProfilePage() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('reports');
  const [myReports, setMyReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- HOOKS ---
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize the navigate function

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchMyReports = async () => {
      if (!user?.token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/reports/myreports", {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMyReports(data);
        }
      } catch (error) {
        console.error("Failed to fetch user reports:", error);
      }
      setIsLoading(false);
    };

    fetchMyReports();
  }, [user]); // Re-fetch if the user changes

  // --- HANDLER FUNCTIONS ---
  const handleEdit = (reportId) => {
    navigate(`/edit-report/${reportId}`);
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to permanently delete this report?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        if (response.ok) {
          setMyReports(prevReports => prevReports.filter(report => report._id !== reportId));
        } else {
          
           toast.error('Failed to delete report.');
        }
      } catch (error) {
        console.error("Failed to delete report:", error);
      }
    }
  };

  // --- JSX / RENDER ---
  return (
    <div className="app">
      <Navbar />
      <main className="feed-container">
        <h1>My Dashboard</h1>
        <h2>Welcome, {user?.name}!</h2>

        <div className="profile-tabs">
          <button 
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
          >
              My Reports
          </button>
          <button 
              className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
          >
              My Messages
          </button>
        </div>

        {isLoading ? (
          <p style={{color: 'white', textAlign: 'center'}}>Loading...</p>
        ) : activeTab === 'reports' ? (
          <div className="feed-column">
            {myReports.length > 0 ? (
              myReports.map((report) => (
                <Post
                  key={report._id}
                  id={report._id}
                  missingPersonName={report.name}
                  poster={report.user}
                  age={report.age}
                  lastSeen={report.lastSeen}
                  photoUrl={report.photoUrl}
                  description={report.description}
                  contactInfo={report.contactInfo}
                  likes={report.likes || []}
                  isOwner={true}
                  onEdit={() => handleEdit(report._id)}
                  onDelete={() => handleDelete(report._id)}
                />
              ))
            ) : (
              <p style={{color: 'white', textAlign: 'center'}}>You have not posted any reports yet.</p>
            )}
          </div>
        ) : (
          <InboxView />
        )}
      </main>
    </div>
  );
}

export default ProfilePage;