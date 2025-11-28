import { useState, useEffect, useContext } from "react";
import { toast } from 'react-toastify';

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { useDebounce } from "../hooks/useDebounce";
import AuthContext from "../context/auth/AuthContext";
import "./AdminDashboardPage.css";



function AdminDashboardPage() {
  // --- STATE MANAGEMENT ---
  // A single source of truth for all reports fetched from the API
  const [allReports, setAllReports] = useState([]); 
  // State for the currently selected tab
  const [activeTab, setActiveTab] = useState('pending'); 
  // State for loading indicators
  const [isLoading, setIsLoading] = useState(true);
  // State for the search bar input
  const [searchTerm, setSearchTerm] = useState('');
  // The debounced search term that triggers the API call
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  // Get the current user from our global context
  const { user } = useContext(AuthContext);

  // --- DATA FETCHING ---
  useEffect(() => {
    // This function fetches all reports. The server-side search handles filtering.
    const fetchAdminReports = async () => {
      if (!user) return; // Don't fetch if the user isn't loaded yet
      setIsLoading(true);
      try {
        const url = `http://localhost:5000/api/reports/all?keyword=${debouncedSearchTerm}`;
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setAllReports(data);
        } else {
          console.error("Failed to fetch admin reports:", data.message);
        }
      } catch (error) {
        console.error("An error occurred fetching admin reports:", error);
      }
      setIsLoading(false);
    };

    fetchAdminReports();
  }, [user, debouncedSearchTerm]); // Re-fetch when user changes or after they stop typing

  // --- ACTION HANDLERS ---
  // A generic handler to perform an action and then refresh the data
  const handleAction = async (reportId, action) => {
    const actions = {
      approve: { url: `/approve`, method: 'PUT' },
      reject: { url: `/reject`, method: 'PUT' },
      found: { url: `/found`, method: 'PUT' },
      delete: { url: `/${reportId}`, method: 'DELETE' },
      revertToPending: { url: `/revert-to-pending`, method: 'PUT' },
      revertToApproved: { url: `/revert-to-approved`, method: 'PUT' },
    };
    
    const currentAction = actions[action];
    if (!currentAction) return;
    
    // Confirmation for the delete action
    if (action === 'delete' && !window.confirm('Are you sure you want to permanently delete this report?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reports${action === 'delete' ? '' : `/${reportId}`}${currentAction.url}`, {
        method: currentAction.method,
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (response.ok) {
        // Refresh the entire list from the server to get the most up-to-date data
        const refreshUrl = `http://localhost:5000/api/reports/all?keyword=${debouncedSearchTerm}`;
        const refreshResponse = await fetch(refreshUrl, { headers: { 'Authorization': `Bearer ${user.token}` } });
        const data = await refreshResponse.json();
        if (refreshResponse.ok) setAllReports(data);
      } else {
         toast.error('Action failed. Please try again.');
      }
    } catch (error) {
      console.error(`Action '${action}' failed:`, error);
    }
  };

  // --- FILTERING FOR DISPLAY ---
  // Filter the full list of reports based on the active tab
  const filteredReports = allReports.filter(report => {
    if (activeTab === 'all') return true;
    return report.status === activeTab;
  });

  // --- JSX / RENDER ---
  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-container">
        <h1>Admin Dashboard</h1>
        <SearchBar
          theme="light"
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
        />
        
        <div className="admin-tabs">
          <button className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
          <button className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending</button>
          <button className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>Approved</button>
          <button className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>Rejected</button>
          <button className={`tab-button ${activeTab === 'found' ? 'active' : ''}`} onClick={() => setActiveTab('found')}>Found</button>
        </div>

        <div className="reports-table">
          {isLoading ? (
            <div className="report-row"><p>Loading...</p></div>
          ) : filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <div key={report._id} className={`report-row status-${report.status}`}>
                <div className="report-info">
                  <Link to={`/report/${report._id}`} target="_blank">{report.name}</Link>
                  <span className="report-status-badge">{report.status}</span>
                </div>
                <div className="report-actions">
                  {report.status === 'pending' && <button onClick={() => handleAction(report._id, 'approve')} className="approve-button">Approve</button>}
                  {report.status === 'pending' && <button onClick={() => handleAction(report._id, 'reject')} className="reject-button">Reject</button>}
                  {report.status === 'approved' && <button onClick={() => handleAction(report._id, 'found')} className="found-button">Mark as Found</button>}
                  {report.status === 'approved' && <button onClick={() => handleAction(report._id, 'reject')} className="reject-button">Unpublish</button>}
                  {report.status === 'rejected' && <button onClick={() => handleAction(report._id, 'revertToPending')} className="revert-button">Re-evaluate</button>}
                  {report.status === 'found' && <button onClick={() => handleAction(report._id, 'revertToApproved')} className="revert-button">Re-list</button>}
                  <button onClick={() => handleAction(report._id, 'delete')} className="delete-button">Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="report-row"><p>No reports match the current filter.</p></div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;