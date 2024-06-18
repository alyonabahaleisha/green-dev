import React from 'react';
import './Spinner.css'; 

const Spinner = () => {
  return (
    <div className="spinner">
      {/* This is a simple spinner, you can customize it with CSS */}
      <div className="double-bounce1"></div>
      <div className="double-bounce2"></div>
    </div>
  );
};

export default Spinner;