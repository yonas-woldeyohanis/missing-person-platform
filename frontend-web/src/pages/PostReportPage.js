import { useState, useContext, useRef } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import AuthContext from "../context/auth/AuthContext";
import "./PostReportPage.css";

function PostReportPage() {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    lastSeen: "",
    description: "",
    contactInfo: "",
    latitude: "",
    longitude: "",
    region: "",
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null); // Ref for clearing the file input

  // --- HOOKS ---
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- HANDLER FUNCTIONS ---
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // In PostReportPage.js

const handleGeocode = async () => {
  if (!formData.lastSeen) {
    // We can also use toast.warn for this kind of message
    toast.warn('Please enter a location to find it on the map.');
    return;
  }
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.lastSeen)}, Ethiopia`);
    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      setFormData({ ...formData, latitude: lat, longitude: lon });
      toast.success(`Location found and coordinates saved!`); // Corrected
    } else {
      toast.error('Could not find coordinates for this location. Please be more specific.'); // Corrected
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
    toast.error('There was an error finding the location.'); // Corrected
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image to upload.");
      return;
    }
    setIsLoading(true);

    // 1. Upload the image
    const formDataForImage = new FormData();
    formDataForImage.append("image", file);

    try {
      const uploadRes = await fetch("http://localhost:5000/api/reports/upload", {
        method: "POST",
        body: formDataForImage,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error("Image upload failed.");
      }
      
      const imageUrl = uploadData.data.secure_url;

      // 2. Prepare the full report data
      const reportData = {
        name: formData.fullName,
        age: formData.age,
        lastSeen: formData.lastSeen,
        description: formData.description,
        contactInfo: formData.contactInfo,
        photoUrl: imageUrl,
        latitude: formData.latitude,
        longitude: formData.longitude,
        region: formData.region, 
      };

      // 3. Submit the report data
      const reportRes = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(reportData),
      });
      const newReport = await reportRes.json();

      if (reportRes.ok) {
toast.success("Report submitted! It is now pending admin approval.");        navigate("/");
      } else {
        throw new Error(newReport.message || "Failed to submit report.");
      }
    } catch (error) {
      console.error("Submission process failed:", error);
toast.error(`An error occurred: ${error.message}`);    } finally {
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
            <h1>Report a Missing Person</h1>
            <p>Please provide as much detail as possible. Every piece of information helps.</p>
          </div>
          <form className="report-form" onSubmit={handleSubmit}>
            {/* --- Section for Name and Age --- */}
            <div className="form-section two-column">
              <div className="input-group">
                <label htmlFor="fullName">Full Name</label>
                <input type="text" id="fullName" placeholder="e.g., Abebe Bikila" required value={formData.fullName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="age">Age</label>
                <input type="number" id="age" placeholder="e.g., 28" value={formData.age} onChange={handleChange} />
              </div>
            </div>

            {/* --- Section for Location and Region --- */}
            <div className="form-section two-column">
              <div className="input-group">
                <label htmlFor="lastSeen">Last Seen Location (City/Town)</label>
                <input type="text" id="lastSeen" placeholder="e.g., Addis Ababa" required value={formData.lastSeen} onChange={handleChange} />
                <button type="button" onClick={handleGeocode} className="geocode-button">Find on Map</button>
              </div>
              <div className="input-group">
                <label htmlFor="region">Region</label>
                <select id="region" value={formData.region} onChange={handleChange} required>
                  <option value="">-- Select a Region --</option>
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Afar">Afar</option>
                  <option value="Amhara">Amhara</option>
                  <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Gambela">Gambela</option>
                  <option value="Harari">Harari</option>
                  <option value="Oromia">Oromia</option>
                  <option value="Sidama">Sidama</option>
                  <option value="Somali">Somali</option>
                  <option value="SNNPR">SNNPR</option>
                  <option value="South West Ethiopia Peoples' Region">South West Ethiopia</option>
                  <option value="Tigray">Tigray</option>
                </select>
              </div>
            </div>

            {/* --- Section for Date Last Seen --- */}
            <div className="form-section full-width">
              <label htmlFor="lastSeenDate">Date Last Seen</label>
              <input type="date" id="lastSeenDate" />
            </div>

            {/* --- Section for Contact Info --- */}
            <div className="form-section full-width">
              <label htmlFor="contactInfo">Your Contact Info (Phone or Email)</label>
              <input type="text" id="contactInfo" placeholder="This will be displayed publicly on the report" required value={formData.contactInfo} onChange={handleChange} />
            </div>

            {/* --- Section for Description --- */}
            <div className="form-section full-width">
              <label htmlFor="description">Physical Description & Clothing</label>
              <textarea id="description" rows="5" placeholder="Include details like height, build, hair color, clothing, and any distinguishing features..." value={formData.description} onChange={handleChange}></textarea>
            </div>
            
            {/* --- Section for Photo Upload --- */}
            <div className="form-section full-width">
              <label htmlFor="photos">Upload Photos</label>
              <input type="file" id="photos" onChange={handleFileChange} ref={fileInputRef} required />
            </div>

            {/* --- Section for Submit Button --- */}
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

export default PostReportPage;