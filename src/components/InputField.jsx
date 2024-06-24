import React from 'react';

const InputField = ({ input, setInput, handleSendMessage, handleClearChat, isStreaming }) => (
  <div className="input-container">
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Enter user message..."
    />
    <button onClick={handleSendMessage} disabled={isStreaming}>Send</button>
    <button onClick={handleClearChat}>Clear All</button>
  </div>
);

export default InputField;
