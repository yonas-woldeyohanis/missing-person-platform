import { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";
import Navbar from "../components/Navbar";
import Post from "../components/Post";
import ReportCard from "../components/ReportCard";
import SearchBar from "../components/SearchBar";
import "./FeedPage.css";
import { motion } from "framer-motion";

// We can define the gradients here as they are just for presentation
const cardGradients = [
  "linear-gradient(to right, #ff9966, #ff5e62)",
  "linear-gradient(to right, #43cea2, #185a9d)",
  "linear-gradient(to right, #ba5370, #f4e2d8)",
  "linear-gradient(to right, #7b4397, #dc2430)",
  "linear-gradient(to right, #00b09b, #96c93d)",
  "linear-gradient(to right, #cb2d3e, #ef473a)",
];

// Animation variants for the container
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function FeedPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

  // This is our main data fetching function. It now accepts a 'searchTerm'
  // and will be passed as a prop to our SearchBar component.
  const fetchReports = async (searchTerm = "") => {
    setIsLoading(true); // Show loading indicator
    try {
      // Build the URL with the search query. If searchTerm is empty, it will fetch all.
      const url = `http://localhost:5000/api/reports?keyword=${searchTerm}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setReports(data);
      } else {
        console.error("Failed to fetch reports:", data.message);
        setReports([]); // Clear reports on error
      }
    } catch (error) {
      console.error("An error occurred while fetching reports:", error);
    }
    setIsLoading(false); // Hide loading indicator
  };

  // In FeedPage.js

  useEffect(() => {
    // The fetch function now uses the debounced term
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const url = `http://localhost:5000/api/reports?keyword=${debouncedSearchTerm}`;
        const response = await fetch(url);
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
      setIsLoading(false);
    };

    fetchReports();
  }, [debouncedSearchTerm]); // <-- CRUCIAL CHANGE: This is the dependency now
 

  return (
    <div className="app">
      <Navbar />
      <main className="feed-container">
        <SearchBar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />

        {isLoading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Loading...</p>
        ) : (
          // Change from feed-grid to feed-column
          <div className="feed-column">
            {reports.length > 0 ? (
              reports.map((report) => (
                // Use the new Post component and pass all the data
                <Post
  key={report._id}
  id={report._id}
  missingPersonName={report.name} // Pass the missing person's name
  poster={report.user}            // Pass the entire user object of the poster
  age={report.age}
  lastSeen={report.lastSeen}
  photoUrl={report.photoUrl}
  description={report.description}
  contactInfo={report.contactInfo}
  likes={report.likes || []} // Use a fallback to prevent errors if 'likes' is missing
/>
              ))
            ) : (
              <p style={{ color: 'white', textAlign: 'center' }}>
                No reports match your search.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default FeedPage;
