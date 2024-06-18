import React, { useState, useEffect } from 'react';
import './FileTree.css';
import Spinner from './Spinner';

const FileTree = ({ onSelectFiles, onDeselectFile, selectedFilePaths }) => {
  const [fileTree, setFileTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [ignoreRules, setIgnoreRules] = useState([]);

  useEffect(() => {
    if (directoryHandle) {
      refetchDirectory(directoryHandle);
    }
  }, [directoryHandle]);

  const handleDirectoryPicker = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
      await refetchDirectory(handle);
    } catch (error) {
      console.error('Error accessing directory:', error);
    }
  };

  const refetchDirectory = async (handle) => {
    setIsLoading(true);
    try {
      const rules = await readGitignore(handle);
      setIgnoreRules(rules);
      const tree = await readDirectory(handle, rules);
      setFileTree(tree);
    } catch (error) {
      console.error('Error accessing directory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const readGitignore = async (directoryHandle) => {
    try {
      const fileHandle = await directoryHandle.getFileHandle('.gitignore', { create: false });
      const file = await fileHandle.getFile();
      const text = await file.text();
      return text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    } catch (error) {
      console.warn('.gitignore file not found or error reading it:', error);
      return [];
    }
  };

  const readDirectory = async (directoryHandle, ignoreRules, parentPath = '') => {
    const entries = [];
    for await (const entry of directoryHandle.values()) {
      const entryPath = `${parentPath}/${entry.name}`;
      if (ignoreRules.some(rule => entryPath.includes(rule))) {
        continue;
      }
      if (entry.kind === 'directory') {
        entries.push({
          name: entry.name,
          type: 'directory',
          children: await readDirectory(entry, ignoreRules, entryPath),
        });
      } else {
        const fileContent = await entry.getFile().then(file => file.text());
        entries.push({
          name: entry.name,
          type: 'file',
          content: fileContent,
          path: entryPath
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
      {fileTree.length > 0 && (
        <button className="refetch-directory" onClick={() => refetchDirectory(directoryHandle)}>Refetch Directory</button>
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
