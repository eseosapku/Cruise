import React from 'react';

interface MessageBubbleProps {
    message: string;
    isUser: boolean;
    timestamp?: Date;
    isLoading?: boolean;
    className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isUser,
    timestamp = new Date(),
    isLoading = false,
    className = ''
}) => {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-white bg-opacity-20 text-white'
                } ${isLoading ? 'animate-pulse' : ''}`}>

                {/* Avatar */}
                <div className="flex items-start space-x-3">
                    {!isUser && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            AI
                        </div>
                    )}

                    <div className="flex-1">
                        {/* Message Content */}
                        <div className="break-words">
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-sm">{message}</span>
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
                            )}
                        </div>

                        {/* Timestamp */}
                        <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-300'
                            }`}>
                            {formatTime(timestamp)}
                        </div>
                    </div>

                    {isUser && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            U
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;