import './StaticPage.css';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

function HelpPage() {
  return (
    <div className="static-page">
      <Navbar />
      <motion.div
        className="static-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className='header'>Help & FAQ</h1>
        <section>
          <h2>Posting a Report</h2>
          <p>
            To post a report, you must first create an account. Click "Sign Up" to register. Once logged in, navigate to "Post Report" and fill in all the details. High-quality, recent photos are the most helpful element of a report.
          </p>
        </section>
        <section>
          <h2>Reporting a Sighting</h2>
          <p>
            If you believe you have seen a missing person, please do not hesitate. Go to their detail page and click "Report a Sighting". Provide the location, date, and time. Your information will be sent directly to the poster of the report. Your personal details will be kept confidential.
          </p>
        </section>
      </motion.div>
    </div>
  );
}

export default HelpPage;