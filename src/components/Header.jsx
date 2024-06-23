import React from 'react';
import './Header.css';

const Header = () => (
  <header className="header-container">
    <div className="header-left">
      <ProjectDropdown />
    </div>
  </header>
);

const ProjectDropdown = () => (
  <div className="project-dropdown">
    <span>GREENDEV.AI</span>
  </div>
);

export default Header;
