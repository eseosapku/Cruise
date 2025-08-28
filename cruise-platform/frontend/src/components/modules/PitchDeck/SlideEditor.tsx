import React, { useState, useEffect } from 'react';

interface Slide {
    id: string;
    type: 'title' | 'content' | 'image' | 'chart' | 'bullet-points';
    title: string;
    content: string;
    layout: string;
    order: number;
}

interface SlideEditorProps {
    slides?: Slide[];
    currentSlideIndex?: number;
    onSaveSlide?: (slide: Slide) => void;
    onAddSlide?: (type: Slide['type']) => void;
    onDeleteSlide?: (slideId: string) => void;
    onSlideOrderChange?: (slides: Slide[]) => void;
    loading?: boolean;
    className?: string;
}

const SlideEditor: React.FC<SlideEditorProps> = ({
    slides = [],
    currentSlideIndex = 0,
    onSaveSlide,
    onAddSlide,
    onDeleteSlide,
    onSlideOrderChange,
    loading = false,
    className = ''
}) => {
    const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempContent, setTempContent] = useState('');

    // Initialize with default slides if none provided
    useEffect(() => {
        if (slides.length === 0) {
            const defaultSlides: Slide[] = [
                {
                    id: '1',
                    type: 'title',
                    title: 'Welcome to Your Pitch Deck',
                    content: 'Start editing your slides to create an amazing presentation',
                    layout: 'center',
                    order: 1
                }
            ];
            setCurrentSlide(defaultSlides[0]);
        } else {
            setCurrentSlide(slides[currentSlideIndex] || slides[0]);
        }
    }, [slides, currentSlideIndex]);

    useEffect(() => {
        if (currentSlide) {
            setTempTitle(currentSlide.title);
            setTempContent(currentSlide.content);
        }
    }, [currentSlide]);

    const slideTypes = [
        { type: 'title' as const, label: 'Title Slide', icon: '📄' },
        { type: 'content' as const, label: 'Content', icon: '📝' },
        { type: 'bullet-points' as const, label: 'Bullet Points', icon: '📋' },
        { type: 'image' as const, label: 'Image', icon: '🖼️' },
        { type: 'chart' as const, label: 'Chart', icon: '📊' }
    ];

    const handleSave = () => {
        if (currentSlide && onSaveSlide) {
            const updatedSlide: Slide = {
                ...currentSlide,
                title: tempTitle,
                content: tempContent
            };
            onSaveSlide(updatedSlide);
            setCurrentSlide(updatedSlide);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (currentSlide) {
            setTempTitle(currentSlide.title);
            setTempContent(currentSlide.content);
        }
        setIsEditing(false);
    };

    const handleSlideSelect = (slide: Slide) => {
        if (isEditing) {
            handleSave();
        }
        setCurrentSlide(slide);
    };

    const handleAddSlide = (type: Slide['type']) => {
        if (onAddSlide) {
            onAddSlide(type);
        }
    };

    const handleDeleteSlide = () => {
        if (currentSlide && onDeleteSlide) {
            onDeleteSlide(currentSlide.id);
        }
    };

    return (
        <div className={`flex h-full ${className}`}>
            {/* Slide Navigation */}
            <div className="w-64 bg-white bg-opacity-10 backdrop-blur-md border-r border-white border-opacity-20 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Slides</h3>
                    <div className="relative group">
                        <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            + Add
                        </button>

                        {/* Add Slide Dropdown */}
                        <div className="absolute right-0 top-full mt-2 bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="p-2 space-y-1 min-w-48">
                                {slideTypes.map((type) => (
                                    <button
                                        key={type.type}
                                        onClick={() => handleAddSlide(type.type)}
                                        className="w-full flex items-center space-x-2 px-3 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                                    >
                                        <span>{type.icon}</span>
                                        <span className="text-sm">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slide List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            onClick={() => handleSlideSelect(slide)}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${currentSlide?.id === slide.id
                                    ? 'bg-blue-600 border-blue-400'
                                    : 'bg-white bg-opacity-10 border-white border-opacity-20 hover:bg-opacity-20'
                                }`}
                        >
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                                    {index + 1}
                                </span>
                                <span className="text-xs text-gray-300 capitalize">
                                    {slide.type}
                                </span>
                            </div>
                            <h4 className="text-sm font-medium text-white truncate">
                                {slide.title || 'Untitled Slide'}
                            </h4>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col">
                {currentSlide ? (
                    <>
                        {/* Editor Header */}
                        <div className="p-6 border-b border-white border-opacity-20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Slide {(slides.findIndex(s => s.id === currentSlide.id) + 1) || 1}
                                    </h2>
                                    <p className="text-blue-200 capitalize">{currentSlide.type} slide</p>
                                </div>

                                <div className="flex space-x-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleCancel}
                                                disabled={loading}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={loading}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={handleDeleteSlide}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 p-6">
                            {isEditing ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Slide Title
                                        </label>
                                        <input
                                            type="text"
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            placeholder="Enter slide title..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Content
                                        </label>
                                        <textarea
                                            value={tempContent}
                                            onChange={(e) => setTempContent(e.target.value)}
                                            rows={12}
                                            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            placeholder="Enter slide content..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Preview Mode */
                                <div className="bg-white rounded-lg p-8 h-full min-h-96">
                                    <div className="h-full flex flex-col justify-center items-center text-center">
                                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                                            {currentSlide.title || 'Untitled Slide'}
                                        </h1>
                                        <div className="text-gray-600 whitespace-pre-wrap max-w-2xl">
                                            {currentSlide.content || 'No content yet. Click Edit to add content.'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* No Slide Selected */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-white mb-2">No slides yet</h3>
                            <p className="text-blue-200 mb-4">Add your first slide to get started</p>
                            <button
                                onClick={() => handleAddSlide('title')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Title Slide
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlideEditor;
