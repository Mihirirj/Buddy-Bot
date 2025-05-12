
import React, { useRef, useState, useEffect } from 'react';

import { getGeminiResponse } from '../gemini';

const ChatForm = ({ setChatHistory }) => {
  const inputRef = useRef();
  const [isSending, setIsSending] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(""); // Control input value

  const handleInputChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const userMessage = currentMessage.trim(); // Use controlled state

    if (!userMessage || isSending) return; // Prevent empty or double submission

    setIsSending(true); // Disable input/button

    
    let currentHistory;
    setChatHistory(prev => {
        currentHistory = [...prev]; // Make a copy of history for the API call
        return prev; // Return unmodified state for now
    });
    // --- History captured ---

    const userMessageId = `user-${Date.now()}`;
    const thinkingId = `thinking-${Date.now()}`; 

    // Add user message AND "Thinking..." message to chat history
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { role: "user", text: userMessage, id: userMessageId },
      { role: "model", text: "Thinking...", id: thinkingId, isLoading: true }, 
    ]);

    setCurrentMessage(""); 

    try {
      console.log("Calling getGeminiResponse with:", userMessage, "and history:", currentHistory);
      // Pass the user message and the history *before* current message/thinking was added
      const botResponseText = await getGeminiResponse(userMessage, currentHistory);

      setChatHistory((prevHistory) =>
        prevHistory.map((msg) =>
          msg.id === thinkingId // Find the specific "Thinking..." message by its ID
            ? { ...msg, text: botResponseText, isLoading: false, id: `model-${Date.now()}` } // Update it
            : msg
        )
      );
    } catch (error) {
      // Catch errors specifically from the getGeminiResponse call or state updates here
      console.error("Error in ChatForm during API call or state update:", error);
      // Replace "Thinking..." with an error message if API fails
      setChatHistory((prevHistory) =>
        prevHistory.map((msg) =>
          msg.id === thinkingId
            ? { ...msg, text: "Sorry, something went wrong getting a response.", isLoading: false, isError: true, id: `error-${Date.now()}` }
            : msg
        )
      );
    } finally {
      setIsSending(false); 
      
      
    }
  };

  
  // useEffect(() => {
  //   if (isChatOpen) { 
  //     inputRef.current?.focus();
  //   }
  // }, [isChatOpen]);

  return (
    <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={currentMessage} // Controlled input
        onChange={handleInputChange} // Handle changes
        placeholder="Type your message..."
        className="message-input"
        required
        disabled={isSending} // Disable while waiting for response
        aria-label="Chat message input"
        autoComplete="off"
      />
      <button
        type="submit"
        className="send-button"
        disabled={isSending || !currentMessage.trim()} // Disable if sending or input is empty/whitespace
        aria-label="Send message"
      >
        <span className="material-symbols-rounded">send</span>
      </button>
    </form>
  );
};

export default ChatForm;
