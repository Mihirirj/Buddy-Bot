
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";


const API_KEY = "AIzaSyADBaGXbOKJ1IwSjcrn-5E6DosmiPhsqWo"; 


let genAI;
let model;


if (API_KEY && API_KEY !== "YOUR_GEMINI_API_KEY") {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  } catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI:", error);
    model = null;
  }
} else {
  console.warn(
    "Gemini API key is missing or is the placeholder value in src/gemini.js. Chatbot will provide mock responses. Please add your API key."
  );
  model = null;
}

const generationConfig = { /* ... keep your existing config ... */ };
const safetySettings = [ /* ... keep your existing settings ... */ ];

// Function to get response from Gemini API
export const getGeminiResponse = async (userMessage, chatHistory = []) => {
  if (!model) {
    console.warn("Gemini model not initialized. Returning mock response.");
    await new Promise(resolve => setTimeout(resolve, 800));
    return `(Mock Response) You said: "${userMessage}". (API not configured or failed to initialize)`;
  }

  console.log("--- [getGeminiResponse START] ---"); // Log start
  console.log("Received userMessage:", userMessage);
  
  console.log("Received chatHistory (raw count):", chatHistory.length);
  console.log("Received chatHistory (raw content):", JSON.stringify(chatHistory, null, 2));

  try {
    
    const apiHistory = chatHistory
      .filter(msg => {
          const shouldKeep =
            msg.id !== "initial-bot-message" && // Filter out initial bot message
            msg.text !== "Thinking..." &&       // Filter out placeholder
            !msg.isError &&                    // Filter out error messages
            msg.role !== 'system';             // Filter out system messages (if any)
          // Detailed log for each message being filtered
          // console.log(`Filtering ID: ${msg.id}, Role: ${msg.role}, Keep: ${shouldKeep}`);
          return shouldKeep;
        }
      )
      .map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user', 
        parts: [{ text: msg.text }],
      }));

    // Log the final history array *after* filtering and mapping, right before sending to API
    console.log("Prepared apiHistory for model.startChat (count):", apiHistory.length);
    console.log("Prepared apiHistory for model.startChat (content):", JSON.stringify(apiHistory, null, 2)); 

    //  Add an explicit check and warning 
    if (apiHistory.length > 0 && apiHistory[0].role !== 'user') {
        console.error(`🆘 CRITICAL WARNING: The first item in apiHistory has role '${apiHistory[0].role}', but should be 'user'. History being sent:`, JSON.stringify(apiHistory, null, 2));
    } else if (apiHistory.length === 0) {
        console.log("Note: apiHistory is empty, which is valid for the first turn.");
    } else {
        console.log(`OK: First item in apiHistory has role '${apiHistory[0].role}'.`);
    }

    // Start a chat session with the model
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: apiHistory, // Pass the filtered and mapped history
    });

    console.log(`---> Sending message to Gemini API: "${userMessage}"`);
    const result = await chatSession.sendMessage(userMessage);

    const responseText = result.response.text();
    console.log("<--- Gemini API Response Received");
    console.log("--- [getGeminiResponse END] ---"); // Log end
    return responseText;

  } catch (error) {
    console.error("❌ Error calling Gemini API:", error); // Log the full error object
    console.log("--- [getGeminiResponse END with ERROR] ---"); // Log end on error

    //  (keep existing specific error message handling) 
    if (error.message?.toLowerCase().includes("api key not valid")) {
      return "Error: API Key is not valid. Please check your configuration in src/gemini.js.";
    }
    

    // Add the specific error check from the console log
    if (error.message?.includes("First content should be with role 'user'")) {
        // This specific error shouldn't happen after the fix, but good to have
        return "Internal Error: Chat history format issue. The API rejected the history order. Please check console logs.";
    }


    // Generic error message if no specific handler matched
    return "Sorry, I encountered an issue trying to respond. Please check the browser console for details.";
  }
};
