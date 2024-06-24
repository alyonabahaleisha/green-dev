import React from 'react';

const FileList = ({ selectedFiles, onDeselectFile }) => (
  <div className="selected-files">
    {selectedFiles.map((file, index) => (
      <span key={index} className="file-tag">
        {file.name}
        <button className="deselect-file" onClick={() => onDeselectFile(file.path)}>x</button>
      </span>
    ))}
  </div>
);

export default FileList;
