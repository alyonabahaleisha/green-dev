import React from 'react';
import { BiChevronRight, BiChevronDown } from "react-icons/bi";
import FileTreeList from './FileTreeList';

const FileTreeFolder = ({ node, expanded, onClick, level, parentPath, expandedFolders, toggleFolder, handleFileClick, selectedFilePaths, onSelectFiles, onDeselectFile }) => (
  <>
    <span
      className={`folder ${expanded ? 'expanded' : ''}`}
      onClick={onClick}
    >
      {expanded ? <BiChevronDown /> : <BiChevronRight />} {node.name}
    </span>
    {expanded && (
      <FileTreeList
        nodes={node.children}
        expandedFolders={expandedFolders}
        toggleFolder={toggleFolder}
        handleFileClick={handleFileClick}
        selectedFilePaths={selectedFilePaths}
        onSelectFiles={onSelectFiles}
        onDeselectFile={onDeselectFile}
        level={level}
        parentPath={parentPath}
      />
    )}
  </>
);

export default FileTreeFolder;
