import React from 'react';
import ChatProvider from './ChatProvider';
import FileList from './FileList';
import MessageList from './MessageList';
import InputField from './InputField';
import './ChatComponent.css';

const ChatComponent = ({ selectedFiles, onDeselectFile, apiKey }) => {
  const [input, setInput] = React.useState('');

  return (
    <div className="chat-container">
      {selectedFiles?.length ? <FileList selectedFiles={selectedFiles} onDeselectFile={onDeselectFile} /> : null}
      
      {apiKey ? (
        <ChatProvider apiKey={apiKey}>
          {({
            messages,
            input,
            setInput,
            error,
            isStreaming,
            handleSendMessage,
            handleClearChat,
          }) => (
            <>
              <MessageList messages={messages} isStreaming={isStreaming} />
              {error && <div className="error">{error}</div>}
              <InputField
                input={input}
                setInput={setInput}
                handleSendMessage={() => handleSendMessage(input, selectedFiles)}
                handleClearChat={handleClearChat}
                isStreaming={isStreaming}
              />
            </>
          )}
        </ChatProvider>
      ) : (
        <>
          <MessageList messages={[]} isStreaming={false} />
          <InputField
            input={input}
            setInput={setInput}
            handleSendMessage={() => {}}
            handleClearChat={() => {}}
            isStreaming={false}
          />
        </>
      )}
    </div>
  );
};

export default ChatComponent;
