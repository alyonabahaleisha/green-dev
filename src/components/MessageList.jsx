import React from 'react';
import Message from './Message';

const MessageList = ({ messages, isStreaming }) => (
  <div className="messages">
    {messages.map((msg, index) => (
      <Message key={index} msg={msg} />
    ))}
    {isStreaming && <div className="message bot">...</div>}
  </div>
);

export default MessageList;
