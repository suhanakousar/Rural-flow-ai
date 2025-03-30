import { useState, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { ChatMessage } from "@/lib/types";

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hello! I'm your RuralFlow AI assistant. How can I help you today with your infrastructure management?",
      sender: "assistant",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call the AI API
      // const response = await apiRequest("POST", "https://api.sree.shop/v1/chat", {
      //   message: input,
      //   history: messages.map(m => ({ role: m.sender, content: m.content }))
      // });
      
      // Simulate API response timing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample AI responses based on keywords in the input
      let aiResponse = "I'm analyzing the data now. Is there anything specific you'd like to know about?";
      
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes("water") || lowerInput.includes("leak")) {
        aiResponse = "The water supply system is currently running at 68% capacity with a flow rate of 45L/m. There's a potential leak detected in the northern sector that needs investigation. Would you like me to dispatch a maintenance alert?";
      } else if (lowerInput.includes("energy") || lowerInput.includes("power")) {
        aiResponse = "Energy consumption is currently optimal. Solar panels are generating 3.4 kW and battery storage is at 78%. Grid usage is minimal at this time due to good weather conditions.";
      } else if (lowerInput.includes("agriculture") || lowerInput.includes("irrigation") || lowerInput.includes("farm")) {
        aiResponse = "The smart irrigation system is active in North and South Field zones. Soil moisture levels are at 42%, which is within optimal range. The system is scheduled to run for another 15 minutes before automatic shutdown.";
      } else if (lowerInput.includes("weather") || lowerInput.includes("forecast")) {
        aiResponse = "The weather forecast shows sunny conditions today with a high of 32°C. There's a chance of rain on Wednesday which should help with water conservation. I've already adjusted irrigation schedules accordingly.";
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "assistant",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="lg:col-span-1 rounded-xl overflow-hidden border border-gray-700 bg-gray-800 shadow-lg">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center animate-pulse mr-2">
              <i className="fas fa-robot text-white"></i>
            </div>
            <h3 className="font-bold text-white">AI Assistant</h3>
          </div>
          <div className="flex space-x-2">
            <button className="text-gray-400 hover:text-white">
              <i className="fas fa-microphone"></i>
            </button>
            <button className="text-gray-400 hover:text-white">
              <i className="fas fa-expand-alt"></i>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start max-w-[85%] ${
                message.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div 
                className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  message.sender === "user" 
                    ? "bg-gradient-to-r from-primary to-gray-700 ml-2" 
                    : "bg-gradient-to-r from-secondary to-primary mr-2"
                }`}
              >
                {message.sender === "user" ? (
                  <span className="text-white text-xs">A</span>
                ) : (
                  <i className="fas fa-robot text-white text-xs"></i>
                )}
              </div>
              <div 
                className={`${
                  message.sender === "user" 
                    ? "bg-primary/20 rounded-tr-none" 
                    : "bg-gray-700/60 rounded-tl-none"
                } rounded-lg p-3`}
              >
                <p className="text-sm text-gray-200">{message.content}</p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
          
          {isProcessing && (
            <div className="flex items-start max-w-[85%]">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-secondary to-primary flex-shrink-0 flex items-center justify-center mr-2">
                <i className="fas fa-robot text-white text-xs"></i>
              </div>
              <div className="bg-gray-700/60 rounded-lg rounded-tl-none p-3">
                <p className="text-sm text-gray-200 flex items-center">
                  <span className="inline-block w-2 h-2 bg-secondary rounded-full mr-1 animate-pulse"></span>
                  <span className="inline-block w-2 h-2 bg-secondary rounded-full mr-1 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  <span className="inline-block w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask RuralFlow AI..."
              className="w-full bg-gray-700/60 border border-gray-600 rounded-lg pl-4 pr-10 py-2 text-gray-200 focus:outline-none focus:ring-1 focus:ring-secondary"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
            />
            <button
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                input.trim() && !isProcessing ? "text-secondary hover:text-white" : "text-gray-500"
              }`}
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <button className="hover:text-gray-200">
              <i className="fas fa-lightbulb mr-1"></i> Suggestions
            </button>
            <div>
              <button className="hover:text-gray-200 mr-2">
                <i className="fas fa-microphone"></i> Voice
              </button>
              <button className="hover:text-gray-200">
                <i className="fas fa-image"></i> Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
