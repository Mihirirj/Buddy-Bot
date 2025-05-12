
import React, { useState, useEffect, useRef } from 'react';
import ChatbotIcon from "./components/ChatbotIcon"; 
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import './index.css'; 

const App = () => {
  // State for the chat messages history
  const [chatHistory, setChatHistory] = useState([
    // Initial greeting message from the bot
    { role: "model", text: "Hey there! I'm your AI Assistant. How can I help you today?", id: "initial-bot-message" }
  ]);
  // State to control if the chat popup is open or closed
  const [isChatOpen, setIsChatOpen] = useState(false); 
  // Ref to the chat body div for scrolling
  const chatBodyRef = useRef(null);

  // Effect to scroll to the bottom of the chat body when chatHistory changes
  useEffect(() => {
    if (chatBodyRef.current) {
      // Smooth scroll for a nicer effect
      chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: 'smooth'
      });
    }
  }, [chatHistory]); // Dependency array: run effect when chatHistory updates

  // Function to toggle the chat popup visibility
  const toggleChatPopup = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    // Use app-container only if you need specific overall layout control
    <div className="app-container">

      {/* Chat Launcher Button: Only shown when chat is closed */}
      {!isChatOpen && (
        <button onClick={toggleChatPopup} className="chatbot-launcher" aria-label="Open chat assistant">
          <ChatbotIcon width="32" height="32"/> 
        </button>
      )}

      {/* Chat Popup Window: Apply 'closed' class based on isChatOpen state */}
      <div className={`chat-popup ${isChatOpen ? '' : 'closed'}`}>

        {/* Chat Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <ChatbotIcon width="30" height="30" /> {/* Icon in header */}
            <h2 className="logo-text">Buddy Bot </h2>
          </div>
          {/* Button to close/minimize the chat */}
          <button onClick={toggleChatPopup} className="material-symbols-rounded close-chat-btn" aria-label="Close chat">
            keyboard_arrow_down {/* Material icon name */}
          </button>
        </div>

        {/* Chat Body: Where messages are displayed */}
        <div className="chat-body" ref={chatBodyRef}>
          {/* Map over chatHistory to render each message */}
          {chatHistory.map((chat) => (
            <ChatMessage key={chat.id} chat={chat} /> // Pass chat object and use unique ID as key
          ))}
        </div>

        {/* Chat Footer: Contains the input form */}
        <div className="chat-footer">
          {/* Pass setChatHistory function down to ChatForm */}
          <ChatForm setChatHistory={setChatHistory} />
        </div>
      </div>
    </div>
  );
};

export default App;
