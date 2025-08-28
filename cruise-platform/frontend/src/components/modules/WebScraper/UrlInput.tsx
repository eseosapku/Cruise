import React, { useState } from 'react';

interface UrlInputProps {
    onSubmit: (url: string, options?: ScrapeOptions) => void;
    loading?: boolean;
    placeholder?: string;
    showOptions?: boolean;
    className?: string;
}

interface ScrapeOptions {
    extractText?: boolean;
    extractImages?: boolean;
    extractLinks?: boolean;
    maxDepth?: number;
    timeout?: number;
}

const UrlInput: React.FC<UrlInputProps> = ({
    onSubmit,
    loading = false,
    placeholder = "Enter URL to scrape...",
    showOptions = true,
    className = ''
}) => {
    const [url, setUrl] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [options, setOptions] = useState<ScrapeOptions>({
        extractText: true,
        extractImages: false,
        extractLinks: false,
        maxDepth: 1,
        timeout: 30
    });
    const [urlHistory, setUrlHistory] = useState<string[]>([]);

    const isValidUrl = (urlString: string) => {
        try {
            new URL(urlString);
            return true;
        } catch (e) {
            return false;
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (url.trim() && isValidUrl(url.trim())) {
            const cleanUrl = url.trim();
            onSubmit(cleanUrl, options);

            // Add to history if not already present
            if (!urlHistory.includes(cleanUrl)) {
                setUrlHistory(prev => [cleanUrl, ...prev.slice(0, 4)]); // Keep last 5
            }

            setUrl('');
        }
    };

    const handleOptionChange = (key: keyof ScrapeOptions, value: boolean | number) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleQuickUrl = (quickUrl: string) => {
        setUrl(quickUrl);
    };

    const quickUrls = [
        'https://example.com',
        'https://news.ycombinator.com',
        'https://techcrunch.com',
        'https://github.com'
    ];

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-2">
                    <div className="flex-1 relative">
                        <input
                            type="url"
                            value={url}
                            onChange={handleChange}
                            placeholder={placeholder}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50"
                            required
                        />

                        {/* URL Validation Indicator */}
                        {url && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {isValidUrl(url) ? (
                                    <div className="w-3 h-3 bg-green-500 rounded-full" title="Valid URL"></div>
                                ) : (
                                    <div className="w-3 h-3 bg-red-500 rounded-full" title="Invalid URL"></div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !url.trim() || !isValidUrl(url)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Scraping...</span>
                            </div>
                        ) : (
                            'Scrape'
                        )}
                    </button>
                </div>

                {/* Advanced Options Toggle */}
                {showOptions && (
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-sm text-blue-300 hover:text-white transition-colors"
                        >
                            {showAdvanced ? '▼ Hide Options' : '▶ Show Options'}
                        </button>

                        <div className="text-xs text-gray-400">
                            {options.extractText && 'Text'}
                            {options.extractImages && ', Images'}
                            {options.extractLinks && ', Links'}
                        </div>
                    </div>
                )}

                {/* Advanced Options */}
                {showOptions && showAdvanced && (
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 space-y-4">
                        <h4 className="text-sm font-medium text-white mb-3">Scraping Options</h4>

                        {/* Extract Options */}
                        <div className="grid grid-cols-3 gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={options.extractText}
                                    onChange={(e) => handleOptionChange('extractText', e.target.checked)}
                                    className="rounded text-blue-600"
                                />
                                <span className="text-sm text-white">Text</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={options.extractImages}
                                    onChange={(e) => handleOptionChange('extractImages', e.target.checked)}
                                    className="rounded text-blue-600"
                                />
                                <span className="text-sm text-white">Images</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={options.extractLinks}
                                    onChange={(e) => handleOptionChange('extractLinks', e.target.checked)}
                                    className="rounded text-blue-600"
                                />
                                <span className="text-sm text-white">Links</span>
                            </label>
                        </div>

                        {/* Numeric Options */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-white mb-1">Max Depth</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={options.maxDepth}
                                    onChange={(e) => handleOptionChange('maxDepth', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white mb-1">Timeout (seconds)</label>
                                <input
                                    type="number"
                                    min="10"
                                    max="120"
                                    value={options.timeout}
                                    onChange={(e) => handleOptionChange('timeout', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </form>

            {/* Quick URLs */}
            <div className="space-y-2">
                <p className="text-sm text-gray-400">Quick URLs:</p>
                <div className="flex flex-wrap gap-2">
                    {quickUrls.map((quickUrl) => (
                        <button
                            key={quickUrl}
                            onClick={() => handleQuickUrl(quickUrl)}
                            disabled={loading}
                            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            {quickUrl.replace('https://', '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* URL History */}
            {urlHistory.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-gray-400">Recent URLs:</p>
                    <div className="space-y-1">
                        {urlHistory.map((historyUrl, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickUrl(historyUrl)}
                                disabled={loading}
                                className="w-full text-left px-3 py-2 text-sm bg-white bg-opacity-10 text-white rounded hover:bg-opacity-20 transition-colors disabled:opacity-50 truncate"
                            >
                                {historyUrl}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-gray-400 space-y-1">
                <p>• Enter a valid URL starting with http:// or https://</p>
                <p>• Use options to customize what data to extract</p>
                <p>• Higher max depth takes longer but gets more content</p>
            </div>
        </div>
    );
};

export default UrlInput;
