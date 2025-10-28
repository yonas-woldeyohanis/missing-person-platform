import './LoginPage.css'; // We can reuse the same CSS!
import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/auth/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';

function SignUpPage() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
const navigate = useNavigate();
const { login } = useContext(AuthContext);

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};



const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    
    // --- THIS IS THE MODIFIED PART ---
    if (response.ok) {
      // Instead of logging in, navigate to the verify page
      // We pass the email in the state so the next page knows who to verify
      navigate('/verify-otp', { state: { email: formData.email } });
    } else {
      toast.success(data.message);
    }
    // ---------------------------------

  } catch (error) {
    
    toast.error('Registration failed. Please try again.');
  }
};
  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="auth-title">{t("create_acc")}</h1>
        <p className="auth-subtitle">{t("sub_cr")}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
  <input type="text" name="name" placeholder={t("full_name")} required value={formData.name} onChange={handleChange} />
  <input type="email" name="email" placeholder={t("email")} required value={formData.email} onChange={handleChange} />
  <input type="password" name="password" placeholder={t("pass")}  required value={formData.password} onChange={handleChange} />
  <button type="submit" className="auth-button">{t("sign_up")} </button>
</form>
        <div className="auth-footer">
          <p>{t("have_acc")} <Link to="/login">{t("login")} </Link></p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignUpPage;