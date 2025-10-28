
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
        position="top-right" // Where the toasts will appear
        autoClose={5000}      // How long they stay (5 seconds)
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/post-report" element={<PostReportPage />} />
        <Route path="/" element={<FeedPage />} />
        <Route path="/report/:id" element={<ReportDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/found" element={<FoundPersonsPage />} />
         <Route path="/profile/:id" element={<PublicProfilePage />} />
         <Route path="/chat/:id" element={<ChatPage />} /> 
         <Route path="/edit-report/:id" element={<EditReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
