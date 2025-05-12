// src/components/ChatMessage.jsx
import React from 'react';
// Corrected import name to PascalCase
import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({ chat }) => {
  // Basic validation for the chat object
  if (!chat || typeof chat.role !== 'string' || typeof chat.text !== 'string' || typeof chat.id !== 'string') {
    console.error("Invalid chat object received in ChatMessage: ", chat);
    return null; // Don't render if data is invalid
  }

  const isUser = chat.role === "user";
  const messageClass = isUser ? "user-message" : "bot-message";
  // Add 'thinking' class if the message is loading
  const textClass = chat.isLoading ? "message-text thinking" : "message-text";

  return (
    <div className={`message ${messageClass}`}>
      {/* Show icon only for bot messages */}
      {!isUser && <ChatbotIcon />}
      <p className={textClass}>{chat.text}</p>
    </div>
  );
};

export default ChatMessage;