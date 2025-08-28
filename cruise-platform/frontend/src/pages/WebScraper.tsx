import React, { useState } from 'react';
import { webScraperService } from '../services/webscraper.service';
import UrlInput from '../components/modules/WebScraper/UrlInput';
import ResultsDisplay from '../components/modules/WebScraper/ResultsDisplay';
import DataAnalysis from '../components/modules/WebScraper/DataAnalysis';
import Loading from '../components/common/Loading';

interface ScrapingResult {
    url: string;
    title?: string;
    content?: string;
    metadata?: any;
    timestamp: Date;
}

const WebScraper: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    const [results, setResults] = useState<ScrapingResult | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [history, setHistory] = useState<ScrapingResult[]>([]);

    const handleUrlSubmit = async (submittedUrl: string) => {
        try {
            setLoading(true);
            setError('');
            setUrl(submittedUrl);

            const result = await webScraperService.scrapeUrl({
                url: submittedUrl,
                options: {
                    extractText: true,
                    extractImages: false,
                    extractLinks: false
                }
            });

            const scrapingResult: ScrapingResult = {
                url: submittedUrl,
                title: result.title,
                content: result.content,
                metadata: result.metadata,
                timestamp: new Date()
            };

            setResults(scrapingResult);
            setHistory(prev => [scrapingResult, ...prev.slice(0, 9)]); // Keep last 10 results
        } catch (err: any) {
            console.error('Scraping failed:', err);
            setError(err?.response?.data?.message || 'Failed to scrape URL');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!results?.content) return;

        try {
            setLoading(true);
            const analysisResult = await webScraperService.analyzeContent(results.content);
            setAnalysis(analysisResult);
        } catch (err: any) {
            console.error('Analysis failed:', err);
            setError('Failed to analyze content');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setUrl('');
        setResults(null);
        setAnalysis(null);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-animated p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <h1 className="text-4xl font-bold text-white mb-3 gradient-text flex items-center">
                        <span className="mr-3">🔍</span>
                        Web Scraper
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Extract and analyze content from web pages with advanced AI analysis
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-xl p-6 mb-8">
                        <p className="text-red-200 flex items-center">
                            <span className="mr-2">⚠️</span>
                            {error}
                        </p>
                        <button
                            onClick={() => setError('')}
                            className="mt-3 text-red-200 hover:text-white underline transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* URL Input Section */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <span className="mr-3">🌐</span>
                        Enter URL to Scrape
                    </h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const url = formData.get('url') as string;
                            if (url.trim()) {
                                handleUrlSubmit(url.trim());
                            }
                        }}
                        className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                    >
                        <input
                            name="url"
                            type="url"
                            placeholder="https://example.com"
                            disabled={loading}
                            className="flex-1 px-6 py-4 bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '🔄 Scraping...' : '🔍 Scrape'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105"
                        >
                            🗑️ Clear
                        </button>
                    </form>
                </div>

                {/* Loading Indicator */}
                {loading && (
                    <div className="glassmorphism rounded-2xl p-8 mb-8 text-center">
                        <Loading size="large" message="Processing content..." />
                    </div>
                )}

                {/* Results Display */}
                {results && (
                    <div className="glassmorphism rounded-2xl p-8 mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <span className="mr-3">📊</span>
                                Scraping Results
                            </h2>
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '🔄 Analyzing...' : '🧠 Analyze Content'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-blue-200 mb-1">URL</h3>
                                <p className="text-white break-all">{results.url}</p>
                            </div>

                            {results.title && (
                                <div>
                                    <h3 className="text-sm font-medium text-blue-200 mb-1">Title</h3>
                                    <p className="text-white">{results.title}</p>
                                </div>
                            )}

                            {results.content && (
                                <div>
                                    <h3 className="text-sm font-medium text-blue-200 mb-1">Content Preview</h3>
                                    <div className="bg-black bg-opacity-30 rounded-lg p-4 max-h-60 overflow-y-auto">
                                        <p className="text-gray-300 text-sm">
                                            {results.content.substring(0, 1000)}
                                            {results.content.length > 1000 && '...'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Analysis Display */}
                {analysis && (
                    <div className="glassmorphism rounded-2xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <span className="mr-3">🧠</span>
                            Content Analysis
                        </h2>
                        <div className="space-y-6">
                            {analysis.summary && (
                                <div className="glassmorphism rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-blue-200 mb-3">Summary</h3>
                                    <p className="text-white leading-relaxed">{analysis.summary}</p>
                                </div>
                            )}

                            {analysis.keywords && (
                                <div className="glassmorphism rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-blue-200 mb-3">Keywords</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {analysis.keywords.map((keyword: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full transition-all duration-300 hover:scale-105"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* History */}
                {history.length > 0 && (
                    <div className="glassmorphism rounded-2xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <span className="mr-3">📚</span>
                            Recent Scrapes
                        </h2>
                        <div className="space-y-3">
                            {history.map((item, index) => (
                                <div
                                    key={index}
                                    className="glassmorphism rounded-xl p-4 hover:bg-white hover:bg-opacity-20 cursor-pointer transition-all duration-300 transform hover:scale-105"
                                    onClick={() => setResults(item)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-medium">
                                                {item.title || item.url}
                                            </p>
                                            <p className="text-blue-200 text-sm">
                                                {item.timestamp.toLocaleString()}
                                            </p>
                                        </div>
                                        <button className="text-blue-300 hover:text-white font-medium transition-colors">
                                            View →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Features Info */}
                {!results && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glassmorphism rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 group">
                            <div className="text-4xl mb-4 group-hover:animate-bounce">🌐</div>
                            <h3 className="text-xl font-bold text-white mb-3">Web Scraping</h3>
                            <p className="text-blue-200">
                                Extract content from any publicly accessible web page with intelligent parsing
                            </p>
                        </div>

                        <div className="glassmorphism rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 group">
                            <div className="text-4xl mb-4 group-hover:animate-bounce">🔍</div>
                            <h3 className="text-xl font-bold text-white mb-3">Content Analysis</h3>
                            <p className="text-blue-200">
                                AI-powered analysis to extract insights, summaries, and key information
                            </p>
                        </div>

                        <div className="glassmorphism rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 group">
                            <div className="text-4xl mb-4 group-hover:animate-bounce">📊</div>
                            <h3 className="text-xl font-bold text-white mb-3">Data Export</h3>
                            <p className="text-blue-200">
                                Export scraped data in various formats for further analysis and use
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebScraper;