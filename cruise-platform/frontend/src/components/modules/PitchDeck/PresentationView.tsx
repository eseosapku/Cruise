import React, { useState, useEffect, useRef } from 'react';

interface Slide {
    id: string;
    type: 'title' | 'content' | 'image' | 'chart' | 'bullet-points';
    title: string;
    content: string;
    layout: string;
    order: number;
}

interface PresentationViewProps {
    slides?: Slide[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showControls?: boolean;
    fullscreen?: boolean;
    onSlideChange?: (slideIndex: number) => void;
    onExit?: () => void;
    className?: string;
}

const PresentationView: React.FC<PresentationViewProps> = ({
    slides = [],
    autoPlay = false,
    autoPlayInterval = 5000,
    showControls = true,
    fullscreen = false,
    onSlideChange,
    onExit,
    className = ''
}) => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isFullscreen, setIsFullscreen] = useState(fullscreen);
    const containerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Default slides if none provided
    const defaultSlides: Slide[] = [
        {
            id: '1',
            type: 'title',
            title: 'Welcome to Your Presentation',
            content: 'This is your pitch deck presentation view',
            layout: 'center',
            order: 1
        },
        {
            id: '2',
            type: 'content',
            title: 'Getting Started',
            content: 'Add slides to your pitch deck to see them here in presentation mode',
            layout: 'left',
            order: 2
        }
    ];

    const displaySlides = slides.length > 0 ? slides : defaultSlides;
    const currentSlide = displaySlides[currentSlideIndex];

    useEffect(() => {
        if (isPlaying && displaySlides.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentSlideIndex(prev =>
                    prev >= displaySlides.length - 1 ? 0 : prev + 1
                );
            }, autoPlayInterval);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, displaySlides.length, autoPlayInterval]);

    useEffect(() => {
        if (onSlideChange) {
            onSlideChange(currentSlideIndex);
        }
    }, [currentSlideIndex, onSlideChange]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                case 'Space':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSlide();
                    break;
                case 'Escape':
                    e.preventDefault();
                    exitPresentation();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
            }
        };

        if (isFullscreen) {
            document.addEventListener('keydown', handleKeyPress);
            return () => document.removeEventListener('keydown', handleKeyPress);
        }
    }, [isFullscreen, currentSlideIndex]);

    const nextSlide = () => {
        setCurrentSlideIndex(prev =>
            prev >= displaySlides.length - 1 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrentSlideIndex(prev =>
            prev <= 0 ? displaySlides.length - 1 : prev - 1
        );
    };

    const goToSlide = (index: number) => {
        setCurrentSlideIndex(index);
    };

    const toggleAutoPlay = () => {
        setIsPlaying(!isPlaying);
    };

    const toggleFullscreen = () => {
        if (!isFullscreen && containerRef.current) {
            containerRef.current.requestFullscreen?.();
            setIsFullscreen(true);
        } else if (isFullscreen) {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    const exitPresentation = () => {
        if (isFullscreen) {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
        if (onExit) {
            onExit();
        }
    };

    const getSlideBackground = (slide: Slide) => {
        switch (slide.type) {
            case 'title':
                return 'bg-gradient-to-br from-blue-600 to-purple-700';
            case 'content':
                return 'bg-gradient-to-br from-gray-50 to-gray-100';
            case 'bullet-points':
                return 'bg-gradient-to-br from-green-50 to-blue-50';
            case 'image':
                return 'bg-gradient-to-br from-purple-50 to-pink-50';
            case 'chart':
                return 'bg-gradient-to-br from-orange-50 to-yellow-50';
            default:
                return 'bg-white';
        }
    };

    const getTextColor = (slide: Slide) => {
        return slide.type === 'title' ? 'text-white' : 'text-gray-800';
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full min-h-screen bg-black ${className}`}
        >
            {/* Main Slide Display */}
            <div className="relative w-full h-full flex items-center justify-center">
                <div
                    className={`w-full max-w-6xl mx-auto aspect-video ${getSlideBackground(currentSlide)} rounded-lg shadow-2xl p-12 flex flex-col justify-center`}
                >
                    <div className={`text-center ${getTextColor(currentSlide)}`}>
                        <h1 className="text-4xl md:text-6xl font-bold mb-8">
                            {currentSlide?.title || 'Untitled Slide'}
                        </h1>

                        {currentSlide?.content && (
                            <div className="text-lg md:text-2xl leading-relaxed max-w-4xl mx-auto">
                                {currentSlide.type === 'bullet-points' ? (
                                    <ul className="text-left space-y-4">
                                        {currentSlide.content.split('\n').filter(line => line.trim()).map((line, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-blue-600 mr-3">•</span>
                                                <span>{line.trim()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="whitespace-pre-wrap">{currentSlide.content}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            {showControls && (
                <>
                    {/* Previous Button */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                        disabled={displaySlides.length <= 1}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                        disabled={displaySlides.length <= 1}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
                        {/* Slide Counter */}
                        <span className="text-white text-sm font-medium">
                            {currentSlideIndex + 1} / {displaySlides.length}
                        </span>

                        {/* Progress Bar */}
                        <div className="w-32 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${((currentSlideIndex + 1) / displaySlides.length) * 100}%` }}
                            />
                        </div>

                        {/* Auto Play Button */}
                        <button
                            onClick={toggleAutoPlay}
                            className="text-white hover:text-blue-400 transition-colors"
                            title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                        >
                            {isPlaying ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </button>

                        {/* Fullscreen Button */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-blue-400 transition-colors"
                            title="Toggle fullscreen"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>

                        {/* Exit Button */}
                        <button
                            onClick={exitPresentation}
                            className="text-white hover:text-red-400 transition-colors"
                            title="Exit presentation"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Slide Thumbnails */}
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-lg p-2 max-h-32 overflow-y-auto">
                        <div className="space-y-1">
                            {displaySlides.map((slide, index) => (
                                <button
                                    key={slide.id}
                                    onClick={() => goToSlide(index)}
                                    className={`w-16 h-10 text-xs rounded border-2 transition-colors ${index === currentSlideIndex
                                            ? 'border-blue-400 bg-blue-500'
                                            : 'border-gray-600 bg-gray-700 hover:border-gray-400'
                                        } text-white flex items-center justify-center`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Keyboard Instructions */}
            {showControls && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs rounded p-2">
                    <div>← → Navigate</div>
                    <div>F Fullscreen</div>
                    <div>ESC Exit</div>
                </div>
            )}
        </div>
    );
};

export default PresentationView;