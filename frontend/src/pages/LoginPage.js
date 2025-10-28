import { useTranslation } from "react-i18next";
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/auth/AuthContext';
import "./LoginPage.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';

function LoginPage() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ email: '', password: '' });
const navigate = useNavigate();
const { login } = useContext(AuthContext);

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      login(data);
      navigate('/');
    } else {
     toast.error(data.message);
    }
  } catch (error) {
    
    toast.error('Login failed. Please try again.');
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
        <h1 className="auth-title">{t("welcome_back")}</h1>
        <p className="auth-subtitle">{t('message')}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
  <input type="email" name="email" placeholder={t("email")} required value={formData.email} onChange={handleChange} />
  <input type="password" name="password" placeholder={t("pass")}required value={formData.password} onChange={handleChange} />
  <button type="submit" className="auth-button">{t("login")}</button>
</form>
        <div className="auth-footer">
          <p>
            {t("no_acc")}<Link to="/signup">{t("sign_up")}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
