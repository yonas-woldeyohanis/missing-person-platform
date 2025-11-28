import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import AuthContext from "../context/auth/AuthContext";
import "./PostReportPage.css"; 
import { toast } from 'react-toastify';

function EditReportPage() {
  // --- HOOKS & CONTEXT ---
  const { id: reportId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    lastSeen: "",
    description: "",
    contactInfo: "",
    latitude: "",
    longitude: "",
  });
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA FETCHING on page load ---
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/reports/${reportId}`);
        const data = await response.json();
        if (response.ok) {
          setFormData({
            fullName: data.name || '',
            age: data.age || '',
            lastSeen: data.lastSeen || '',
            description: data.description || '',
            contactInfo: data.contactInfo || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
          });
          setCurrentPhotoUrl(data.photoUrl);
        }
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      }
      setIsLoading(false);
    };
    fetchReportData();
  }, [reportId]);

  // --- HANDLER FUNCTIONS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleGeocode = async () => { /* ... existing handleGeocode function ... */ };
  
  // In EditReportPage.js

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  let updatedPhotoUrl = currentPhotoUrl; // Start with the existing photo URL

  try {
    // --- STEP 1: If a new file was selected, upload it ---
    if (file) {
      const formDataForImage = new FormData();
      formDataForImage.append('image', file);
      
      const uploadRes = await fetch("http://localhost:5000/api/reports/upload", {
        method: "POST",
        body: formDataForImage,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        updatedPhotoUrl = uploadData.data.secure_url; // Get the new URL
      } else {
        // If upload fails, throw an error to be caught below
        throw new Error('Image upload failed. Please try again.');
      }
    }

    // --- STEP 2: Submit the final updated data ---
    const updatedData = {
      name: formData.fullName,
      age: formData.age,
      lastSeen: formData.lastSeen,
      description: formData.description,
      contactInfo: formData.contactInfo,
      latitude: formData.latitude,
      longitude: formData.longitude,
      photoUrl: updatedPhotoUrl, // Use either the new or the original URL
    };

    const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();
    if (response.ok) {
    
      toast('Report updated successfully!');
      navigate('/profile');
    } else {
      // If the report update fails, throw an error
      throw new Error(data.message || 'Failed to update report.');
    }

  } catch (error) {
    // --- CATCH ALL ERRORS ---
    console.error("Update process failed:", error);
   toast.error(`An error occurred: ${error.message}`);
  } finally {
    // --- ALWAYS RUN THIS ---
    // This 'finally' block guarantees that loading is set to false,
    // whether the process succeeded or failed.
    setIsLoading(false);
  }
};
  // --- JSX / RENDER ---
  return (
    <div className="post-report-page">
      <Navbar />
      <main className="post-report-container">
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="form-header">
            <h1>Edit Your Report</h1>
            <p>Update the information for your report below.</p>
          </div>
          
          {isLoading ? (
            <p>Loading form...</p>
          ) : (
            <form className="report-form" onSubmit={handleSubmit}>
              {/* --- THIS IS THE MISSING FORM JSX --- */}
              <div className="form-section two-column">
                <div className="input-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input type="text" id="fullName" required value={formData.fullName} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label htmlFor="age">Age</label>
                  <input type="number" id="age" value={formData.age} onChange={handleChange} />
                </div>
              </div>

              <div className="form-section two-column">
                <div className="input-group">
                  <label htmlFor="lastSeen">Last Seen Location</label>
                  <input type="text" id="lastSeen" required value={formData.lastSeen} onChange={handleChange} />
                  <button type="button" onClick={handleGeocode} className="geocode-button">Find on Map</button>
                </div>
                <div className="input-group">
                  <label htmlFor="lastSeenDate">Date Last Seen</label>
                  <input type="date" id="lastSeenDate" />
                </div>
              </div>

              <div className="form-section full-width">
                <label htmlFor="contactInfo">Your Contact Info (Phone or Email)</label>
                <input type="text" id="contactInfo" required value={formData.contactInfo} onChange={handleChange} />
              </div>

              <div className="form-section full-width">
                <label htmlFor="description">Physical Description & Clothing</label>
                <textarea id="description" rows="5" value={formData.description} onChange={handleChange}></textarea>
              </div>
              {/* --- END OF MISSING FORM JSX --- */}

              <div className="form-section full-width">
                <label>Current Photo</label>
                {currentPhotoUrl && (
                  <img src={currentPhotoUrl} alt="Current report" className="edit-form-photo-preview" />
                )}
                <label htmlFor="photos">Upload a New Photo (Optional)</label>
                <input type="file" id="photos" onChange={handleFileChange} ref={fileInputRef} />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Report'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default EditReportPage;