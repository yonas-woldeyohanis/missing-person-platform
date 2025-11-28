// frontend/src/components/MainLayout.js
import React from 'react';
import Navbar from './Navbar'; // We'll render the Navbar here
import './MainLayout.css';    // We'll create this CSS file next

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

export default MainLayout;