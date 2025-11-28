import "./LoginPage.css";
import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/auth/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false); // <-- New loading state
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const email = location.state?.email;

  // --- Corrected Countdown Timer Logic ---
  useEffect(() => {
    // Only run the timer if it's greater than 0
    if (timer > 0) {
      const interval = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      // Cleanup function to clear the timeout
      return () => clearTimeout(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]); // This effect depends only on the 'timer' state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // <-- Set loading to true to disable button

    if (!email) {
      toast.error("Could not find user email. Please try signing up again.");
      navigate("/signup");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.toUpperCase() }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false); // <-- Set loading to false after API call is done
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h1 className="auth-title">Verify Your Account</h1>
        <p className="auth-subtitle">
          An OTP has been sent to your email: <strong>{email || "..."}</strong>
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          {/* Disable button while loading */}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Log In"}
          </button>
        </form>
        <div className="resend-container">
          {canResend ? (
            <button className="resend-button" disabled>
              Resend OTP (Feature coming soon)
            </button>
          ) : (
            <p>Resend OTP in {timer}s</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
export default VerifyOtpPage;
