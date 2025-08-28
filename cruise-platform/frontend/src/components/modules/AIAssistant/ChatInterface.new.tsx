import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ChatInterfaceProps {
    messages?: Message[];
    onSendMessage?: (message: string) => void;
    loading?: boolean;
    className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages = [],
    onSendMessage,
    loading = false,
    className = ''
}) => {
    const [input, setInput] = useState('');
    const [internalMessages, setInternalMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use external messages if provided, otherwise use internal state
    const displayMessages = messages.length > 0 ? messages : internalMessages;

    useEffect(() => {
        scrollToBottom();
    }, [displayMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (input.trim() && !loading) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: input.trim(),
                sender: 'user',
                timestamp: new Date()
            };

            if (onSendMessage) {
                onSendMessage(input.trim());
            } else {
                // Internal message handling for standalone use
                setInternalMessages(prev => [...prev, newMessage]);

                // Simulate AI response
                setTimeout(() => {
                    const aiResponse: Message = {
                        id: (Date.now() + 1).toString(),
                        text: `AI response to: "${input.trim()}"`,
                        sender: 'ai',
                        timestamp: new Date()
                    };
                    setInternalMessages(prev => [...prev, aiResponse]);
                }, 1000);
            }

            setInput('');
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        setInternalMessages([]);
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Chat Header */}
            <div className="flex justify-between items-center p-4 border-b border-white border-opacity-20">
                <h3 className="text-lg font-semibold text-white">AI Chat</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={handleClearChat}
                        className="px-3 py-1 text-sm bg-red-500 bg-opacity-20 text-red-200 rounded hover:bg-opacity-30 transition-colors"
                        disabled={loading}
                    >
                        Clear
                    </button>
                    <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {displayMessages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                        <div className="text-4xl mb-4">🤖</div>
                        <p>Start a conversation with the AI assistant!</p>
                        <p className="text-sm mt-2">Type your message below to get started.</p>
                    </div>
                ) : (
                    displayMessages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message.text}
                            timestamp={message.timestamp}
                            isUser={message.sender === 'user'}
                        />
                    ))
                )}

                {loading && (
                    <MessageBubble
                        message="AI is thinking..."
                        timestamp={new Date()}
                        isUser={false}
                        isLoading={true}
                    />
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white border-opacity-20">
                <div className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50"
                        maxLength={1000}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Sending</span>
                            </div>
                        ) : (
                            'Send'
                        )}
                    </button>
                </div>

                {/* Character Count */}
                <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <span>{input.length}/1000</span>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
