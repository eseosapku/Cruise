import React, { useState, useEffect } from 'react';
import { aiService } from '../services/ai.service';
import ChatInterface from '../components/modules/AIAssistant/ChatInterface';
import VoiceControl from '../components/modules/AIAssistant/VoiceControl';
import Loading from '../components/common/Loading';

interface ChatMessage {
    id: string;
    message: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

const AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // Add welcome message
        setMessages([{
            id: 'welcome',
            message: 'Hello! I\'m your AI assistant. How can I help you today?',
            role: 'assistant',
            timestamp: new Date()
        }]);
    }, []);

    const handleSendMessage = async (message: string) => {
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            message,
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError('');

        try {
            const response = await aiService.chat(message);

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                message: response.response,
                role: 'assistant',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            console.error('AI chat error:', err);
            setError('Failed to get AI response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceMessage = (message: string) => {
        handleSendMessage(message);
    };

    const handleClearChat = () => {
        setMessages([{
            id: 'welcome',
            message: 'Hello! I\'m your AI assistant. How can I help you today?',
            role: 'assistant',
            timestamp: new Date()
        }]);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-animated p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="glassmorphism rounded-2xl p-8 mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4 gradient-text">
                        🧠 AI Assistant
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Get intelligent help with your projects and content creation
                    </p>
                </div>

                {/* AI Chat Container */}
                <div className="glassmorphism rounded-3xl p-8 min-h-[700px] flex flex-col shadow-2xl border border-white border-opacity-20">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
                        <div>
                            <h2 className="text-3xl font-bold text-white flex items-center mb-2">
                                <span className="mr-3 text-4xl">💬</span>
                                Chat with AI
                            </h2>
                            <p className="text-blue-200 text-sm">Ask me anything about your business, content, or strategy</p>
                        </div>
                        <div className="flex space-x-3">
                            <VoiceControl />
                            <button
                                onClick={handleClearChat}
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                            >
                                <span>🗑️</span>
                                <span>Clear Chat</span>
                            </button>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-2xl p-6 mb-6 backdrop-blur-md">
                            <div className="flex items-center space-x-3">
                                <span className="text-red-300 text-2xl">⚠️</span>
                                <div>
                                    <h4 className="text-red-200 font-semibold">Error</h4>
                                    <p className="text-red-200">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto mb-8 space-y-6 max-h-96 px-4 py-4 bg-black bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-10">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl transform transition-all duration-300 hover:scale-105 ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                            : 'bg-white bg-opacity-15 backdrop-blur-md text-white border border-white border-opacity-20 shadow-lg'
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="text-xl">
                                                {msg.role === 'user' ? '👤' : '🤖'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm leading-relaxed font-medium">{msg.message}</p>
                                                <p className="text-xs opacity-70 mt-2 flex items-center">
                                                    <span className="mr-1">🕒</span>
                                                    {msg.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Form */}
                        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const message = formData.get('message') as string;
                                    if (message.trim()) {
                                        handleSendMessage(message);
                                        e.currentTarget.reset();
                                    }
                                }}
                                className="flex space-x-4"
                            >
                                <div className="flex-1 relative">
                                    <input
                                        name="message"
                                        type="text"
                                        placeholder="Type your message here..."
                                        disabled={loading}
                                        className="w-full px-6 py-4 bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 shadow-lg text-lg"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        💭
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Thinking...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send</span>
                                            <span>🚀</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-center space-x-2 text-blue-200">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                                <span>AI is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Features */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glassmorphism rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 group shadow-xl border border-white border-opacity-20">
                        <div className="text-5xl mb-6 group-hover:animate-bounce">🎯</div>
                        <h3 className="text-2xl font-bold text-white mb-4">Content Strategy</h3>
                        <p className="text-blue-200 leading-relaxed">
                            Get professional help with content planning and strategic direction for your business projects
                        </p>
                        <div className="mt-6 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    </div>

                    <div className="glassmorphism rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 group shadow-xl border border-white border-opacity-20">
                        <div className="text-5xl mb-6 group-hover:animate-bounce">✍️</div>
                        <h3 className="text-2xl font-bold text-white mb-4">Writing Assistant</h3>
                        <p className="text-blue-200 leading-relaxed">
                            Enhance your writing skills and create compelling, professional content that resonates
                        </p>
                        <div className="mt-6 h-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                    </div>

                    <div className="glassmorphism rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 group shadow-xl border border-white border-opacity-20">
                        <div className="text-5xl mb-6 group-hover:animate-bounce">📊</div>
                        <h3 className="text-2xl font-bold text-white mb-4">Data Analysis</h3>
                        <p className="text-blue-200 leading-relaxed">
                            Analyze complex data sets and gain valuable insights for strategic business decisions
                        </p>
                        <div className="mt-6 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-12 glassmorphism rounded-3xl p-10 shadow-xl border border-white border-opacity-20">
                    <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
                            <span className="mr-3 text-4xl">⚡</span>
                            Quick Actions
                        </h3>
                        <p className="text-blue-200 text-lg">Get started instantly with these popular AI assistance options</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <button
                            onClick={() => handleSendMessage("Help me create a pitch deck outline")}
                            className="group px-6 py-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg border border-white border-opacity-20"
                        >
                            <div className="text-3xl mb-3 group-hover:animate-bounce">🚀</div>
                            <div className="font-semibold">Pitch Deck Help</div>
                            <div className="text-sm opacity-90 mt-2">Create compelling presentations</div>
                        </button>
                        <button
                            onClick={() => handleSendMessage("Suggest content ideas for my project")}
                            className="group px-6 py-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg border border-white border-opacity-20"
                        >
                            <div className="text-3xl mb-3 group-hover:animate-bounce">💡</div>
                            <div className="font-semibold">Content Ideas</div>
                            <div className="text-sm opacity-90 mt-2">Brainstorm creative concepts</div>
                        </button>
                        <button
                            onClick={() => handleSendMessage("Review and improve my writing")}
                            className="group px-6 py-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg border border-white border-opacity-20"
                        >
                            <div className="text-3xl mb-3 group-hover:animate-bounce">📝</div>
                            <div className="font-semibold">Writing Review</div>
                            <div className="text-sm opacity-90 mt-2">Enhance your content</div>
                        </button>
                        <button
                            onClick={() => handleSendMessage("Help me analyze market data")}
                            className="group px-6 py-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg border border-white border-opacity-20"
                        >
                            <div className="text-3xl mb-3 group-hover:animate-bounce">📈</div>
                            <div className="font-semibold">Data Analysis</div>
                            <div className="text-sm opacity-90 mt-2">Uncover insights</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;