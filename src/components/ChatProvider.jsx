import { useState, useEffect } from 'react';
import { useChatCompletion } from 'openai-streaming-hooks';

const ChatProvider = ({ apiKey, children }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const { messages: streamedMessages, resetMessages, submitPrompt, loading: isLoading, error: chatError } = useChatCompletion({
    model: 'gpt-4o',
    apiKey: apiKey,
    temperature: 0.9,
  });

  useEffect(() => {
    if (chatError) {
      setError(chatError.message);
      console.error("Chat error:", chatError.message);
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

  const handleSendMessage = (input, selectedFiles) => {
    if (input.trim() === '') return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsStreaming(true);

    const combinedContext = `${input}\n\n${selectedFiles.map(file => file.name + file.content).join('\n\n')}`;
    submitPrompt([{ content: combinedContext, role: 'user' }]);
  };

  const handleClearChat = () => {
    resetMessages();
    setMessages([]);
  };

  return children({
    messages,
    input,
    setInput,
    error,
    isStreaming,
    handleSendMessage,
    handleClearChat,
  });
};

export default ChatProvider;
