import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <div className="header-container">
      <div className="header-left">
        <div className="project-dropdown">
          <span>Personal</span>
          <span> / </span>
          <span>Green Dev</span>
        </div>
      </div>
      <div className="header-right">
        <a href="#dashboard">Dashboard</a>
        <a href="#docs">Docs</a>
        <a href="#api-reference">API reference</a>
        <div className="profile-icon">
          <img src="path/to/profile.jpg" alt="Profile" />
        </div>
      </div>
    </div>
  );
};

export default Header;
