import React, { useState, useEffect, useRef } from 'react';

// Add type declarations for Speech Recognition API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface VoiceControlProps {
    onVoiceMessage?: (message: string) => void;
    disabled?: boolean;
    className?: string;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
    onVoiceMessage,
    disabled = false,
    className = ''
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string>('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check if speech recognition is supported
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            setIsSupported(true);

            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setError('');
                setTranscript('');
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscript(finalTranscript || interimTranscript);

                if (finalTranscript && onVoiceMessage) {
                    onVoiceMessage(finalTranscript.trim());
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                setIsListening(false);
                setError(`Speech recognition error: ${event.error}`);
            };

            recognitionRef.current = recognition;
        } else {
            setIsSupported(false);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onVoiceMessage]);

    const startListening = () => {
        if (recognitionRef.current && !isListening && !disabled) {
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isSupported) {
        return (
            <div className={`p-2 ${className}`}>
                <button
                    disabled
                    className="p-2 bg-gray-500 text-white rounded-lg opacity-50 cursor-not-allowed"
                    title="Speech recognition not supported in this browser"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 19L5 5m0 0l14 14M5 5v.01M5 5v.01" />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center space-y-2 ${className}`}>
            {/* Voice Button */}
            <button
                onClick={toggleListening}
                disabled={disabled}
                className={`p-3 rounded-full transition-all duration-200 ${isListening
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
            >
                {isListening ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v6m0 0l4-4m-4 4L8 3m0 9a9 9 0 109 9 9 9 0 00-9-9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8a3 3 0 00-3 3v2a3 3 0 006 0v-2a3 3 0 00-3-3z" />
                    </svg>
                )}
            </button>

            {/* Status Indicator */}
            <div className="text-center min-h-[2rem]">
                {isListening && (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white">Listening...</span>
                    </div>
                )}

                {transcript && (
                    <div className="text-xs text-gray-300 max-w-xs truncate">
                        "{transcript}"
                    </div>
                )}

                {error && (
                    <div className="text-xs text-red-400 max-w-xs">
                        {error}
                    </div>
                )}
            </div>

            {/* Instructions */}
            {!isListening && !transcript && !error && (
                <div className="text-xs text-gray-400 text-center max-w-xs">
                    Click to start voice input
                </div>
            )}
        </div>
    );
};

export default VoiceControl;