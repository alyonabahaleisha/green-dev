import React, { useState, useEffect, useCallback } from 'react';
import './FileTree.css';

// Using Font Awesome Icons for folder and file representation
import { FaFolder, FaFolderOpen, FaFile, FaSync } from 'react-icons/fa'; 
import { BiChevronRight, BiChevronDown } from "react-icons/bi";
import { LuFolderSync } from "react-icons/lu";
import Spinner from './Spinner';

const FileTree = ({ onSelectFiles, onDeselectFile, selectedFilePaths }) => {
  const [fileTree, setFileTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [ignoreRules, setIgnoreRules] = useState([]);

  useEffect(() => {
    if (directoryHandle) refetchDirectory(directoryHandle);
  }, [directoryHandle]);

  const handleDirectoryPicker = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
    } catch (error) {
      console.error('Error accessing directory:', error);
    }
  };

  const refetchDirectory = useCallback(async (handle) => {
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
  }, []);

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
      if (ignoreRules.some(rule => entryPath.includes(rule))) continue;

      if (entry.kind === 'directory') {
        const children = await readDirectory(entry, ignoreRules, entryPath);
        entries.push({ name: entry.name, type: 'directory', children });
      } else {
        const fileContent = await entry.getFile().then(file => file.text());
        entries.push({ name: entry.name, type: 'file', content: fileContent, path: entryPath });
      }
    }
    return entries.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1));
  };

  const toggleFolder = (path) => setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));

  const handleFileClick = (file) => {
    selectedFilePaths.includes(file.path) ? onDeselectFile(file.path) : onSelectFiles(prev => [...prev, file]);
  };

  const renderTree = (nodes, level = 0, parentPath = '') => (
    <ul data-level={level}>
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
                  {expandedFolders[currentPath] ? <BiChevronDown /> : <BiChevronRight />} {node.name}
                </span>
                {expandedFolders[currentPath] && renderTree(node.children, level + 1, currentPath)}
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
      <div className="filetree-header">
        <h3>Project File Tree</h3>
        {fileTree.length !== 0 && (
          <button className="btn refetch-directory" onClick={() => refetchDirectory(directoryHandle)}>
            <LuFolderSync />
          </button>
        )}
      </div>
      {fileTree.length === 0 ? (
        <button className="btn directory-picker" onClick={handleDirectoryPicker}>Select Directory</button>
      ) : (
        <div className="file-tree">
          {isLoading ? <Spinner /> : fileTree.length > 0 ? renderTree(fileTree) : <p>No directory selected</p>}
        </div>
      )}
    </div>
  );
};

export default FileTree;
