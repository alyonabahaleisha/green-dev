import React from 'react';
import FileTreeFile from './FileTreeFile';
import FileTreeFolder from './FileTreeFolder';

const FileTreeList = ({ nodes, expandedFolders, toggleFolder, handleFileClick, selectedFilePaths, onSelectFiles, onDeselectFile, level = 0, parentPath = '' }) => (
  <ul data-level={level}>
    {nodes.map((node, index) => {
      const currentPath = `${parentPath}/${node.name}`;
      return (
        <li key={index}>
          {node.type === 'directory' ? (
            <FileTreeFolder
              node={node}
              expanded={expandedFolders[currentPath]}
              onClick={() => toggleFolder(currentPath)}
              level={level + 1}
              parentPath={currentPath}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              handleFileClick={handleFileClick}
              selectedFilePaths={selectedFilePaths}
              onSelectFiles={onSelectFiles}
              onDeselectFile={onDeselectFile}
            />
          ) : (
            <FileTreeFile
              node={node}
              selected={selectedFilePaths.includes(node.path)}
              onClick={() => handleFileClick(node)}
            />
          )}
        </li>
      );
    })}
  </ul>
);

export default FileTreeList;
