// frontend/src/App.js

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from './components/MainLayout'; // <-- IMPORT THE LAYOUT

// Import Pages
import FeedPage from "./pages/FeedPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PostReportPage from "./pages/PostReportPage";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import FoundPersonsPage from './pages/FoundPersonsPage';
import PublicProfilePage from './pages/PublicProfilePage'; 
import ChatPage from './pages/ChatPage';
import EditReportPage from './pages/EditReportPage';

function App() {
  return (
    <Router>
       <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* --- Routes WITHOUT Navbar --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        {/* --- Routes WITH Navbar (wrapped in MainLayout) --- */}
        <Route path="/" element={<MainLayout><FeedPage /></MainLayout>} />
        <Route path="/report/:id" element={<MainLayout><ReportDetailPage /></MainLayout>} />
        <Route path="/post-report" element={<MainLayout><PostReportPage /></MainLayout>} />
        <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
        <Route path="/help" element={<MainLayout><HelpPage /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
        <Route path="/admin" element={<MainLayout><AdminDashboardPage /></MainLayout>} />
        <Route path="/found" element={<MainLayout><FoundPersonsPage /></MainLayout>} />
        <Route path="/profile/:id" element={<MainLayout><PublicProfilePage /></MainLayout>} />
        <Route path="/chat/:id" element={<MainLayout><ChatPage /></MainLayout>} /> 
        <Route path="/edit-report/:id" element={<MainLayout><EditReportPage /></MainLayout>} />
      </Routes>
    </Router>
  );
}

export default App;