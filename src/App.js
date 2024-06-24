import React, { useState } from 'react';
import ChatComponent from './components/ChatComponent';
import Header from './components/Header';
import FileTree from './components/FileTree';
import './App.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [apiKey, setApiKey] = useState('');

  const handleSelectFiles = (files) => {
    setSelectedFiles(files);
  };

  const handleDeselectFile = (filePath) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.path !== filePath));
  };

  const handleApiKeyChange = (key) => {
    setApiKey(key);
  };

  return (
    <div className="App">
      <Header onApiKeyChange={handleApiKeyChange} />
      <div className="main-content">
        <FileTree onSelectFiles={handleSelectFiles} onDeselectFile={handleDeselectFile} selectedFilePaths={selectedFiles.map(file => file.path)} />
        <ChatComponent selectedFiles={selectedFiles} onDeselectFile={handleDeselectFile} apiKey={apiKey} />
      </div>
    </div>
  );
}

export default App;
