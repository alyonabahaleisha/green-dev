import React from 'react';
import { LuFolderSync } from "react-icons/lu";

const FileTreeHeader = ({ fileTreeLength, onRefetch }) => (
  <div className="filetree-header">
    <h3>Project File Tree</h3>
    {fileTreeLength > 0 && (
      <button className="btn refetch-directory" onClick={onRefetch}>
        <LuFolderSync />
      </button>
    )}
  </div>
);

export default FileTreeHeader;
