import React, { useState, useEffect } from 'react';
import { useChatCompletion } from 'openai-streaming-hooks';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy, dark, atelierLakesideLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './ChatComponent.css';

const ChatComponent = ({ selectedFiles, onDeselectFile }) => {
  const [ms, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const { messages: streamedMessages, submitPrompt, isLoading, error: chatError } = useChatCompletion({
    model: 'gpt-4o', // Required
    apiKey: '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', // Required
    temperature: 0.9,
  });

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [ms]);

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
  }, [streamedMessages, isLoading])

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    const userMessage = { sender: 'user', text: input };
    setMessages([...ms, userMessage]);
    setInput('');
    setIsStreaming(true);

    const combinedContext = `${input}\n\n${selectedFiles.map(file => file.content).join('\n\n')}`;
    submitPrompt([{ content: combinedContext, role: 'user' }]);
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
        {ms.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <ReactMarkdown
              children={msg.text}
              remarkPlugins={[remarkGfm]}
              components={{code({ children, language, value, ...rest}) {return(
                <div style={{ position: 'relative', paddingTop: "10px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                  <CopyToClipboard text={children}>
                    <button className="copy-button" style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
                      Copy
                    </button>
                  </CopyToClipboard>
                  <SyntaxHighlighter language={language} style={atelierLakesideLight}>
                    {children}
                  </SyntaxHighlighter>
                </div>
              )}}}
            />
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
