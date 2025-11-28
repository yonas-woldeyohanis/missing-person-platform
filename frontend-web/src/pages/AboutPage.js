import './StaticPage.css'; // Using a shared CSS file
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

function AboutPage() {
  return (
    <div className="static-page">
      <Navbar />
      <motion.div
        className="static-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className='header'>About Our Platform</h1>
        <section>
          <h2>Our Mission</h2>
          <p>
            Our mission is to leverage technology to bridge the gap between missing persons and their families in Ethiopia. We provide a centralized, accessible, and free platform to share information and bring loved ones back home.
          </p>
        </section>
        <section>
          <h2>How It Works</h2>
          <p>
            Families can create a detailed report for a missing person, including photos and critical information. The public can browse these reports and, if they have information, submit a confidential sighting report directly to the family or authorities.
          </p>
        </section>
      </motion.div>
    </div>
  );
}

export default AboutPage;