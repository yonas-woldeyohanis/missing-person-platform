import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Post from '../components/Post'; // We'll reuse our Post component
import './FeedPage.css'; // We can reuse the feed styles

function PublicProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id: userId } = useParams(); // Get the user ID from the URL

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/profile`);
        const data = await response.json();
        if (response.ok) {
          setProfileData(data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [userId]); // Re-fetch if the user ID in the URL changes

  return (
    <div className="app">
      <Navbar />
      <main className="feed-container">
        {isLoading ? (
          <p style={{ color: 'white' }}>Loading profile...</p>
        ) : profileData ? (
          <>
            <h1 style={{ color: 'white', textAlign: 'center' }}>{profileData.name}'s Reports</h1>
            <div className="feed-column">
              {profileData.reports.length > 0 ? (
                profileData.reports.map((report) => (
                  <Post
                    key={report._id}
                    id={report._id}
                    missingPersonName={report.name}
                    poster={report.user} // Pass the user object
                    age={report.age}
                    lastSeen={report.lastSeen}
                    photoUrl={report.photoUrl}
                    description={report.description}
                    contactInfo={report.contactInfo}
                    likes={report.likes || []}
                  />
                ))
              ) : (
                <p style={{ color: 'white' }}>This user has no approved reports.</p>
              )}
            </div>
          </>
        ) : (
          <h1 style={{ color: 'white', textAlign: 'center' }}>User Not Found</h1>
        )}
      </main>
    </div>
  );
}
export default PublicProfilePage;