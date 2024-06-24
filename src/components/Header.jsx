import React, { useState } from 'react';
import './Header.css';

const Header = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');

  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    onApiKeyChange(newKey);
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <ProjectDropdown />
      </div>
      <div className="header-right">
        <div className="api-key-container">
          <label htmlFor="api-key-input">OpenAI API Key:</label>
          <input
            id="api-key-input"
            type="text"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter OpenAI API Key"
            className="api-key-input"
          />
        </div>
      </div>
    </header>
  );
};

const ProjectDropdown = () => (
  <div className="project-dropdown">
    <span>GREENDEV.AI</span>
  </div>
);

export default Header;
