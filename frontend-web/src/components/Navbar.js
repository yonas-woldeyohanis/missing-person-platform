import { Link } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useContext } from 'react'; // Add this
import { useNavigate } from 'react-router-dom'; // Add this
import AuthContext from '../context/auth/AuthContext'; // Add this
function Navbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  const { user, logout } = useContext(AuthContext);
const navigate = useNavigate();

const handleLogout = () => {
  logout();
  setIsNavOpen(false); // Close mobile nav if open
  navigate('/login'); // Redirect to login page
};

  
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          Aberus-Platform
        </Link>

        <div className="navbar-links">
          
          <Link to="/about">{t("about")}</Link>
          <Link to="/help">{t("help")}</Link>
          <Link to="/found">{t("found")}</Link> 
          <Link to="/post-report">{t("post_Report")}</Link>
          {user ? (
  <>
    <Link to="/profile">{t("profile")}</Link>
{user && user.isAdmin && (
  <Link to="/admin">Admin</Link>
)}
    <button onClick={handleLogout} className="nav-logout-button">{t("logout")}</button>
  </>
) : (
  <Link to="/login" className="nav-login-button">Login</Link>
)}
          <div className="language-switcher">
            <button onClick={() => changeLanguage("en")}>EN</button>
            <button onClick={() => changeLanguage("am")}>አማ</button>
          </div>
        </div>

        <div
          className="hamburger-menu"
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <div></div>
          <div></div>
          <div></div>
        </div>
      </nav>

      {/* --- Mobile Navigation Menu --- */}
      <AnimatePresence>
        {isNavOpen && (
          <>
            {/* This is the dark overlay */}
            <motion.div
              className="mobile-nav-backdrop"
              onClick={() => setIsNavOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {/* This is the menu panel itself */}
            <motion.div
              className="mobile-nav-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
            >
              <div
                className="mobile-nav-close"
                onClick={() => setIsNavOpen(false)}
              >
                &times;
              </div>
              
              <Link to="/about" onClick={() => setIsNavOpen(false)}>
                About
              </Link>
              <Link to="/help" onClick={() => setIsNavOpen(false)}>
                Help
              </Link>
              <Link to="/found" onClick={() => setIsNavOpen(false)}>Found</Link>
              <Link to="/post-report" onClick={() => setIsNavOpen(false)}>
                Post Report
              </Link>
              {user ? (
  <>
    <Link to="/profile" onClick={() => setIsNavOpen(false)}>Profile</Link>
    <a href="#" onClick={handleLogout} className="nav-logout-button-mobile .nav-login-button ">Logout</a>
  </>
) : (
  <Link to="/login" onClick={() => setIsNavOpen(false)}>Login</Link>
)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
