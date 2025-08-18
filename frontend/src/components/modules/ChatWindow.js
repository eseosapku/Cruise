import React, { useState, useRef, useEffect } from 'react';
import apiService from '../../services/apiService';

const ChatWindow = ({ isOpen, onClose, currentPhase }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I'm here to help you navigate your entrepreneurship journey. What would you like to work on today?",
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isAI: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to AI service
      const response = await apiService.post('/ai/conversation', {
        message: inputValue,
        context: currentPhase,
        conversationHistory: messages.slice(-5) // Send last 5 messages for context
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isAI: true,
        timestamp: new Date(),
        suggestions: response.data.suggestions || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI conversation error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        isAI: true,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceRecognition = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const getPhaseGreeting = () => {
    const greetings = {
      ideation: "Let's explore and validate your business ideas! 💡",
      research: "Time to dive deep into market research! 🔍",
      cofounder: "Let's find your perfect co-founder! 🤝",
      pitchDeck: "Ready to create an amazing pitch deck! 📊",
      meetings: "I'll help you prepare for successful meetings! 🎯",
      product: "Let's plan your product development journey! 🚀"
    };
    return greetings[currentPhase] || "How can I assist you today?";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-effect w-full max-w-2xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white border-opacity-20">
          <div>
            <h2 className="text-white text-xl font-bold">🤖 AI Assistant</h2>
            <p className="text-white text-opacity-70 text-sm">{getPhaseGreeting()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white text-opacity-70 hover:text-opacity-100 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-3/4 p-3 rounded-lg ${
                  message.isAI
                    ? message.isError
                      ? 'bg-red-500 bg-opacity-20 text-red-300'
                      : 'bg-white bg-opacity-10 text-white'
                    : 'bg-blue-500 bg-opacity-30 text-white'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.text}</div>
                
                {/* AI Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-white text-opacity-70 text-xs">Suggestions:</div>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-sm bg-white bg-opacity-10 hover:bg-opacity-20 rounded p-2 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="text-white text-opacity-50 text-xs mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white bg-opacity-10 text-white p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">🤖</div>
                  <div>AI is thinking...</div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white border-opacity-20">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or use voice input..."
                className="glass-input resize-none h-12"
                disabled={isLoading}
              />
            </div>
            
            {recognition.current && (
              <button
                onClick={startVoiceRecognition}
                disabled={isListening || isLoading}
                className={`glass-button px-3 ${
                  isListening ? 'bg-red-500 bg-opacity-30' : ''
                } disabled:opacity-50`}
              >
                {isListening ? '🎤' : '🎙️'}
              </button>
            )}
            
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="glass-button px-4 disabled:opacity-50"
            >
              Send
            </button>
          </div>
          
          <div className="mt-2 text-white text-opacity-50 text-xs">
            Press Enter to send • Shift+Enter for new line
            {recognition.current && ' • Click microphone for voice input'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
