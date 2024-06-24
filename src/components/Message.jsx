import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Message = ({ msg }) => {
  const [isCopied, setIsCopied] = useState(false);

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
    <div className={`message ${msg.sender}`}>
      {renderMessageContent(msg.text)}
    </div>
  );
};

export default Message;
