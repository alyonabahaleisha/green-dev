import React, { useState, useEffect, useCallback } from 'react';
import FileTreeHeader from './FileTreeHeader';
import FileTreeList from './FileTreeList';
import Spinner from './Spinner';
import './FileTree.css';

const FileTreeContainer = ({ onSelectFiles, onDeselectFile, selectedFilePaths }) => {
  const [fileTree, setFileTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState(null);

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

  return (
    <div className="filetree-container">
      <FileTreeHeader fileTreeLength={fileTree.length} onRefetch={() => refetchDirectory(directoryHandle)} />
      {fileTree.length === 0 ? (
        <button className="btn directory-picker" onClick={handleDirectoryPicker}>Select Directory</button>
      ) : (
        <div className="file-tree">
          {isLoading ? <Spinner /> : fileTree.length > 0 ? (
            <FileTreeList
              nodes={fileTree}
              expandedFolders={expandedFolders}
              toggleFolder={(path) => setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }))}
              handleFileClick={handleFileClick}
              selectedFilePaths={selectedFilePaths}
              onSelectFiles={onSelectFiles}
              onDeselectFile={onDeselectFile}
            />
          ) : <p>No directory selected</p>}
        </div>
      )}
    </div>
  );
};

export default FileTreeContainer;
