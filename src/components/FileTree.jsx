import React, { useState, useEffect } from 'react';
import './FileTree.css';
import Spinner from './Spinner';

const FileTree = ({ onSelectFiles, onDeselectFile, selectedFilePaths }) => {
  const [fileTree, setFileTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState(null);

  useEffect(() => {
    if (directoryHandle) {
      refetchDirectory();
    }
  }, [directoryHandle]);

  const handleDirectoryPicker = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
    } catch (error) {
      console.error('Error accessing directory:', error);
    }
  };

  const refetchDirectory = async () => {
    setIsLoading(true);
    try {
      const tree = await readDirectory(directoryHandle);
      setFileTree(tree);
    } catch (error) {
      console.error('Error accessing directory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const readDirectory = async (directoryHandle) => {
    const entries = [];
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'directory') {
        entries.push({
          name: entry.name,
          type: 'directory',
          children: await readDirectory(entry),
        });
      } else {
        const fileContent = await entry.getFile().then(file => file.text());
        entries.push({
          name: entry.name,
          type: 'file',
          content: fileContent,
          path: `${directoryHandle.name}/${entry.name}`
        });
      }
    }
    return entries.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
  };

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleFileClick = (file) => {
    if (!selectedFilePaths.includes(file.path)) {
      onSelectFiles(prev => [...prev, file]);
    } else {
      onDeselectFile(file.path);
    }
  };

  const renderTree = (nodes, parentPath = '') => (
    <ul>
      {nodes.map((node, index) => {
        const currentPath = `${parentPath}/${node.name}`;
        return (
          <li key={index}>
            {node.type === 'directory' ? (
              <>
                <span
                  className={`folder ${expandedFolders[currentPath] ? 'expanded' : ''}`}
                  onClick={() => toggleFolder(currentPath)}
                >
                  {node.name}
                </span>
                {expandedFolders[currentPath] && renderTree(node.children, currentPath)}
              </>
            ) : (
              <span
                className={`file ${selectedFilePaths.includes(node.path) ? 'selected' : ''}`}
                onClick={() => handleFileClick(node)}
              >
                {node.name}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="filetree-container">
      <h3>Project File Tree</h3>
      {fileTree.length === 0 && (
        <button className="select-directory" onClick={handleDirectoryPicker}>Select Directory</button>
      )}
      <div className="file-tree">
        {isLoading ? (
          <Spinner />
        ) : fileTree.length > 0 ? (
          renderTree(fileTree)
        ) : (
          <p>No directory selected</p>
        )}
      </div>
    </div>
  );
};

export default FileTree;