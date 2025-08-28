import React, { useState, useMemo } from 'react';

interface ScrapedData {
    id: string;
    url: string;
    title: string;
    description: string;
    content: string;
    images: Array<{
        src: string;
        alt: string;
        width?: number;
        height?: number;
    }>;
    links: Array<{
        url: string;
        text: string;
        type: 'internal' | 'external';
    }>;
    metadata: {
        scrapedAt: string;
        responseTime: number;
        statusCode: number;
        contentType: string;
        wordCount: number;
        imageCount: number;
        linkCount: number;
    };
    error?: string;
}

interface ResultsDisplayProps {
    results: ScrapedData[];
    loading?: boolean;
    onExport?: (format: 'json' | 'csv' | 'txt') => void;
    onDelete?: (id: string) => void;
    onRefresh?: (url: string) => void;
    className?: string;
}

type ViewMode = 'list' | 'grid' | 'table';
type FilterType = 'all' | 'success' | 'error';
type SortBy = 'date' | 'title' | 'wordCount' | 'responseTime';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    results,
    loading = false,
    onExport,
    onDelete,
    onRefresh,
    className = ''
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

    // Filter and sort results
    const filteredAndSortedResults = useMemo(() => {
        let filtered = results.filter(result => {
            // Apply filter
            if (filter === 'success' && result.error) return false;
            if (filter === 'error' && !result.error) return false;

            // Apply search
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    result.title.toLowerCase().includes(searchLower) ||
                    result.description.toLowerCase().includes(searchLower) ||
                    result.url.toLowerCase().includes(searchLower) ||
                    result.content.toLowerCase().includes(searchLower)
                );
            }

            return true;
        });

        // Sort results
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'date':
                    comparison = new Date(b.metadata.scrapedAt).getTime() - new Date(a.metadata.scrapedAt).getTime();
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'wordCount':
                    comparison = a.metadata.wordCount - b.metadata.wordCount;
                    break;
                case 'responseTime':
                    comparison = a.metadata.responseTime - b.metadata.responseTime;
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [results, filter, sortBy, sortOrder, searchTerm]);

    const handleSelectResult = (id: string) => {
        const newSelected = new Set(selectedResults);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedResults(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedResults.size === filteredAndSortedResults.length) {
            setSelectedResults(new Set());
        } else {
            setSelectedResults(new Set(filteredAndSortedResults.map(r => r.id)));
        }
    };

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedResults);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedResults(newExpanded);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white">Processing scraped data...</p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className={`text-center py-12 ${className}`}>
                <div className="text-6xl mb-4">🕷️</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
                <p className="text-gray-400">Start by entering a URL to scrape above</p>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header Controls */}
            <div className="bg-white bg-opacity-10 rounded-lg p-4 space-y-4">
                {/* Search and Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search results..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div className="text-sm text-gray-300">
                        {filteredAndSortedResults.length} of {results.length} results
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* View Mode */}
                    <div className="flex bg-white bg-opacity-10 rounded-lg">
                        {(['list', 'grid', 'table'] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${viewMode === mode
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Filter */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterType)}
                        className="px-3 py-1 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white text-sm"
                    >
                        <option value="all">All Results</option>
                        <option value="success">Successful</option>
                        <option value="error">Errors</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="px-3 py-1 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white text-sm"
                    >
                        <option value="date">Date</option>
                        <option value="title">Title</option>
                        <option value="wordCount">Word Count</option>
                        <option value="responseTime">Response Time</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-1 bg-white bg-opacity-20 text-white rounded hover:bg-opacity-30 transition-colors text-sm"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>

                    {/* Export */}
                    {onExport && (
                        <div className="flex gap-2">
                            {['json', 'csv', 'txt'].map((format) => (
                                <button
                                    key={format}
                                    onClick={() => onExport(format as 'json' | 'csv' | 'txt')}
                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                    {format.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bulk Actions */}
                {selectedResults.size > 0 && (
                    <div className="flex items-center gap-4 p-3 bg-blue-600 bg-opacity-20 rounded-lg">
                        <span className="text-sm text-white">
                            {selectedResults.size} selected
                        </span>
                        <button
                            onClick={() => setSelectedResults(new Set())}
                            className="text-sm text-blue-300 hover:text-white"
                        >
                            Clear
                        </button>
                        {onDelete && (
                            <button
                                onClick={() => {
                                    selectedResults.forEach(id => onDelete(id));
                                    setSelectedResults(new Set());
                                }}
                                className="text-sm text-red-300 hover:text-red-200"
                            >
                                Delete Selected
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Results Display */}
            {viewMode === 'table' ? (
                <div className="bg-white bg-opacity-10 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white bg-opacity-10">
                                <tr>
                                    <th className="p-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedResults.size === filteredAndSortedResults.length && filteredAndSortedResults.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="p-3 text-left text-white text-sm font-medium">URL</th>
                                    <th className="p-3 text-left text-white text-sm font-medium">Title</th>
                                    <th className="p-3 text-left text-white text-sm font-medium">Words</th>
                                    <th className="p-3 text-left text-white text-sm font-medium">Images</th>
                                    <th className="p-3 text-left text-white text-sm font-medium">Links</th>
                                    <th className="p-3 text-left text-white text-sm font-medium">Status</th>
                                    <th className="p-3 text-left text-white text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedResults.map((result) => (
                                    <tr key={result.id} className="border-t border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedResults.has(result.id)}
                                                onChange={() => handleSelectResult(result.id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="p-3 text-sm text-gray-300 max-w-xs truncate">
                                            {result.url}
                                        </td>
                                        <td className="p-3 text-sm text-white max-w-xs truncate">
                                            {result.title || 'Untitled'}
                                        </td>
                                        <td className="p-3 text-sm text-gray-300">
                                            {result.metadata.wordCount.toLocaleString()}
                                        </td>
                                        <td className="p-3 text-sm text-gray-300">
                                            {result.metadata.imageCount}
                                        </td>
                                        <td className="p-3 text-sm text-gray-300">
                                            {result.metadata.linkCount}
                                        </td>
                                        <td className="p-3">
                                            {result.error ? (
                                                <span className="inline-block px-2 py-1 text-xs bg-red-600 text-white rounded">
                                                    Error
                                                </span>
                                            ) : (
                                                <span className="inline-block px-2 py-1 text-xs bg-green-600 text-white rounded">
                                                    Success
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleExpanded(result.id)}
                                                    className="text-xs text-blue-300 hover:text-white"
                                                >
                                                    View
                                                </button>
                                                {onRefresh && (
                                                    <button
                                                        onClick={() => onRefresh(result.url)}
                                                        className="text-xs text-green-300 hover:text-white"
                                                    >
                                                        Refresh
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(result.id)}
                                                        className="text-xs text-red-300 hover:text-white"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
                    {filteredAndSortedResults.map((result) => (
                        <div key={result.id} className="bg-white bg-opacity-10 rounded-lg p-6 space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedResults.has(result.id)}
                                        onChange={() => handleSelectResult(result.id)}
                                        className="mt-1 rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white truncate">
                                            {result.title || 'Untitled'}
                                        </h3>
                                        <a
                                            href={result.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-300 hover:text-blue-200 truncate block"
                                        >
                                            {result.url}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {result.error ? (
                                        <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                                            Error
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                                            Success
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {result.description && (
                                <p className="text-gray-300 text-sm">
                                    {result.description}
                                </p>
                            )}

                            {/* Error Display */}
                            {result.error && (
                                <div className="p-3 bg-red-600 bg-opacity-20 border border-red-600 border-opacity-30 rounded text-red-200 text-sm">
                                    {result.error}
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400 block">Words</span>
                                    <span className="text-white">{result.metadata.wordCount.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Images</span>
                                    <span className="text-white">{result.metadata.imageCount}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Links</span>
                                    <span className="text-white">{result.metadata.linkCount}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">Response</span>
                                    <span className="text-white">{result.metadata.responseTime}ms</span>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedResults.has(result.id) && !result.error && (
                                <div className="space-y-4 pt-4 border-t border-white border-opacity-20">
                                    {/* Content Preview */}
                                    {result.content && (
                                        <div>
                                            <h4 className="text-white font-medium mb-2">Content Preview</h4>
                                            <div className="p-3 bg-white bg-opacity-10 rounded text-gray-300 text-sm max-h-32 overflow-y-auto">
                                                {result.content.slice(0, 500)}
                                                {result.content.length > 500 && '...'}
                                            </div>
                                        </div>
                                    )}

                                    {/* Images */}
                                    {result.images.length > 0 && (
                                        <div>
                                            <h4 className="text-white font-medium mb-2">Images ({result.images.length})</h4>
                                            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                                                {result.images.slice(0, 6).map((image, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={image.src}
                                                        alt={image.alt}
                                                        className="w-full h-16 object-cover rounded"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Links */}
                                    {result.links.length > 0 && (
                                        <div>
                                            <h4 className="text-white font-medium mb-2">Links ({result.links.length})</h4>
                                            <div className="max-h-32 overflow-y-auto space-y-1">
                                                {result.links.slice(0, 5).map((link, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block text-sm text-blue-300 hover:text-blue-200 truncate"
                                                    >
                                                        {link.text || link.url}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-20">
                                <span className="text-xs text-gray-400">
                                    {formatDate(result.metadata.scrapedAt)}
                                </span>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => toggleExpanded(result.id)}
                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        {expandedResults.has(result.id) ? 'Collapse' : 'Expand'}
                                    </button>

                                    {onRefresh && (
                                        <button
                                            onClick={() => onRefresh(result.url)}
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                        >
                                            Refresh
                                        </button>
                                    )}

                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(result.id)}
                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State for Filtered Results */}
            {filteredAndSortedResults.length === 0 && results.length > 0 && (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Results Found</h3>
                    <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    );
};

export default ResultsDisplay;