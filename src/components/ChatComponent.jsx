import React, { useState, useEffect } from 'react';
import { useChatCompletion } from 'openai-streaming-hooks';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatComponent.css';

const ChatComponent = ({ selectedFiles, onDeselectFile }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { messages: streamedMessages, submitPrompt, isLoading, error: chatError } = useChatCompletion({
    model: 'gpt-4o',
    apiKey: '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',
    temperature: 0.9,
  });

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages]);

  useEffect(() => {
    if (chatError) {
      setError(chatError.message);
      setIsStreaming(false);
    }
  }, [chatError]);

  useEffect(() => {
    if (streamedMessages.length > 0) {
      const lastStreamedMessage = streamedMessages[streamedMessages.length - 1].content;
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.sender === 'bot') {
          lastMessage.text = lastStreamedMessage;
          return [...prevMessages.slice(0, -1), lastMessage];
        } else {
          return [...prevMessages, { sender: 'bot', text: lastStreamedMessage }];
        }
      });
      if (!isLoading) {
        setIsStreaming(false);
      }
    }
  }, [streamedMessages, isLoading]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsStreaming(true);

    const combinedContext = `${input}\n\n${selectedFiles.map(file => file.content).join('\n\n')}`;
    submitPrompt([{ content: combinedContext, role: 'user' }]);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderMessageContent = (text) => {
    const codeBlockRegex = /```(\w*)\n([\s\S]+?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const [fullMatch, lang, code] = match;
      const index = match.index;

      if (index > lastIndex) {
        parts.push(<ReactMarkdown key={lastIndex} remarkPlugins={[remarkGfm]}>{text.substring(lastIndex, index)}</ReactMarkdown>);
      }

      parts.push(
        <div key={index} className="code-block">
          <div className="code-block-header">
            <span className="language-label">{lang || 'text'}</span>
            <button onClick={() => handleCopy(code)}>
              {isCopied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <SyntaxHighlighter style={darcula} language={lang || 'text'} PreTag="div">
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = index + fullMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push(<ReactMarkdown key={lastIndex} remarkPlugins={[remarkGfm]}>{text.substring(lastIndex)}</ReactMarkdown>);
    }

    return parts;
  };

  return (
    <div className="chat-container">
      <div className="selected-files">
        {selectedFiles.map((file, index) => (
          <span key={index} className="file-tag">
            {file.name}
            <button className="deselect-file" onClick={() => onDeselectFile(file.path)}>x</button>
          </span>
        ))}
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {renderMessageContent(msg.text)}
          </div>
        ))}
        {isStreaming && <div className="message bot">...</div>}
      </div>
      {error && <div className="error">{error}</div>}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter user message..."
        />
        <button onClick={handleSendMessage} disabled={isStreaming}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
