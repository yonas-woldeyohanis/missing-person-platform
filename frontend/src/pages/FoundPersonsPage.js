import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import { useDebounce } from "../hooks/useDebounce";
import Navbar from "../components/Navbar";
import ReportCard from "../components/ReportCard"; // We can reuse our card component!
import "./FeedPage.css"; // We can reuse our feed styles!
import { motion } from "framer-motion";
import Post from '../components/Post'; 

function FoundPersonsPage() {
  const [foundReports, setFoundReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchFoundReports = async () => {
      try {
        const url = `http://localhost:5000/api/reports/found?keyword=${debouncedSearchTerm}`;
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          setFoundReports(data);
        }
      } catch (error) {
        console.error("Failed to fetch found reports:", error);
      }
    };
    fetchFoundReports();
  }, [debouncedSearchTerm]); // Re-run on search
  return (
    <div className="app">
      <Navbar />
      <main className="feed-container">
        <h1
          style={{ color: "white", textAlign: "center", marginBottom: "2rem" }}
        >
          Reunited: Our Success Stories
        </h1>
        <SearchBar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
        <motion.div
          className="feed-column"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {foundReports.length > 0 ? (
            foundReports.map((report) => (
              <Post
    key={report._id}
    id={report._id}
    name={report.name}
    age={report.age}
    lastSeen={report.lastSeen}
    photoUrl={report.photoUrl}
    description={report.description}
    contactInfo={report.contactInfo}
    likes={report.likes}
  />
            ))
          ) : (
            <p style={{ color: "white", textAlign: "center" }}>
              No found persons have been reported yet.
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default FoundPersonsPage;
