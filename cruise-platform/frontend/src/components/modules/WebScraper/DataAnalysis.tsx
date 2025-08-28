import React, { useState, useMemo } from 'react';

interface AnalysisData {
    id: string;
    url: string;
    title: string;
    content: string;
    wordCount: number;
    imageCount: number;
    linkCount: number;
    scrapedAt: string;
    responseTime: number;
    keywords?: string[];
    sentiment?: {
        score: number;
        label: 'positive' | 'negative' | 'neutral';
        confidence: number;
    };
    readabilityScore?: number;
    topics?: Array<{
        topic: string;
        confidence: number;
    }>;
}

interface DataAnalysisProps {
    data: AnalysisData[];
    loading?: boolean;
    className?: string;
}

type AnalysisTab = 'overview' | 'content' | 'performance' | 'insights';

const DataAnalysis: React.FC<DataAnalysisProps> = ({
    data,
    loading = false,
    className = ''
}) => {
    const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');
    const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

    // Calculate analytics
    const analytics = useMemo(() => {
        if (!data.length) return null;

        const totalWords = data.reduce((sum, item) => sum + item.wordCount, 0);
        const totalImages = data.reduce((sum, item) => sum + item.imageCount, 0);
        const totalLinks = data.reduce((sum, item) => sum + item.linkCount, 0);
        const avgResponseTime = data.reduce((sum, item) => sum + item.responseTime, 0) / data.length;
        const avgReadability = data.filter(item => item.readabilityScore).reduce((sum, item) => sum + (item.readabilityScore || 0), 0) / data.filter(item => item.readabilityScore).length;

        // Sentiment analysis
        const sentimentData = data.filter(item => item.sentiment);
        const sentimentCounts = {
            positive: sentimentData.filter(item => item.sentiment?.label === 'positive').length,
            negative: sentimentData.filter(item => item.sentiment?.label === 'negative').length,
            neutral: sentimentData.filter(item => item.sentiment?.label === 'neutral').length,
        };

        // Top keywords
        const allKeywords = data.flatMap(item => item.keywords || []);
        const keywordCounts = allKeywords.reduce((acc, keyword) => {
            acc[keyword] = (acc[keyword] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const topKeywords = Object.entries(keywordCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        // Content length distribution
        const contentLengthRanges = {
            short: data.filter(item => item.wordCount < 500).length,
            medium: data.filter(item => item.wordCount >= 500 && item.wordCount < 2000).length,
            long: data.filter(item => item.wordCount >= 2000).length,
        };

        // Performance metrics
        const performanceRanges = {
            fast: data.filter(item => item.responseTime < 1000).length,
            medium: data.filter(item => item.responseTime >= 1000 && item.responseTime < 3000).length,
            slow: data.filter(item => item.responseTime >= 3000).length,
        };

        return {
            totalWords,
            totalImages,
            totalLinks,
            avgResponseTime,
            avgReadability,
            sentimentCounts,
            topKeywords,
            contentLengthRanges,
            performanceRanges,
            totalPages: data.length
        };
    }, [data]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center py-12 ${className}`}>
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white">Analyzing data...</p>
            </div>
        );
    }

    if (!data.length || !analytics) {
        return (
            <div className={`text-center py-12 ${className}`}>
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Data to Analyze</h3>
                <p className="text-gray-400">Scrape some websites first to see analytics</p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'content', label: 'Content', icon: '📝' },
        { id: 'performance', label: 'Performance', icon: '⚡' },
        { id: 'insights', label: 'Insights', icon: '💡' }
    ];

    const StatCard = ({ title, value, subtitle, color = 'blue' }: {
        title: string;
        value: string | number;
        subtitle?: string;
        color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
    }) => {
        const colorClasses = {
            blue: 'bg-blue-600',
            green: 'bg-green-600',
            purple: 'bg-purple-600',
            yellow: 'bg-yellow-600',
            red: 'bg-red-600'
        };

        return (
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className={`w-8 h-8 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}>
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                <p className="text-sm text-gray-300">{title}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
        );
    };

    const ProgressBar = ({ label, value, max, color = 'blue' }: {
        label: string;
        value: number;
        max: number;
        color?: string;
    }) => {
        const percentage = Math.round((value / max) * 100);
        return (
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-white">{value} ({percentage}%)</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div
                        className={`h-2 bg-${color}-600 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Data Analysis</h2>
                    <p className="text-gray-400">Insights from {analytics.totalPages} scraped pages</p>
                </div>

                <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                    className="px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white"
                >
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                </select>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white bg-opacity-10 rounded-lg p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as AnalysisTab)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Pages"
                                value={analytics.totalPages.toLocaleString()}
                                subtitle="Scraped successfully"
                                color="blue"
                            />
                            <StatCard
                                title="Total Words"
                                value={analytics.totalWords.toLocaleString()}
                                subtitle="Content extracted"
                                color="green"
                            />
                            <StatCard
                                title="Total Images"
                                value={analytics.totalImages.toLocaleString()}
                                subtitle="Images found"
                                color="purple"
                            />
                            <StatCard
                                title="Total Links"
                                value={analytics.totalLinks.toLocaleString()}
                                subtitle="Links discovered"
                                color="yellow"
                            />
                        </div>

                        {/* Summary Charts */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Content Length Distribution */}
                            <div className="bg-white bg-opacity-10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Content Length Distribution</h3>
                                <div className="space-y-3">
                                    <ProgressBar
                                        label="Short (< 500 words)"
                                        value={analytics.contentLengthRanges.short}
                                        max={analytics.totalPages}
                                        color="green"
                                    />
                                    <ProgressBar
                                        label="Medium (500-2000 words)"
                                        value={analytics.contentLengthRanges.medium}
                                        max={analytics.totalPages}
                                        color="blue"
                                    />
                                    <ProgressBar
                                        label="Long (> 2000 words)"
                                        value={analytics.contentLengthRanges.long}
                                        max={analytics.totalPages}
                                        color="purple"
                                    />
                                </div>
                            </div>

                            {/* Performance Distribution */}
                            <div className="bg-white bg-opacity-10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Response Time Distribution</h3>
                                <div className="space-y-3">
                                    <ProgressBar
                                        label="Fast (< 1s)"
                                        value={analytics.performanceRanges.fast}
                                        max={analytics.totalPages}
                                        color="green"
                                    />
                                    <ProgressBar
                                        label="Medium (1-3s)"
                                        value={analytics.performanceRanges.medium}
                                        max={analytics.totalPages}
                                        color="yellow"
                                    />
                                    <ProgressBar
                                        label="Slow (> 3s)"
                                        value={analytics.performanceRanges.slow}
                                        max={analytics.totalPages}
                                        color="red"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {/* Content Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard
                                title="Avg. Word Count"
                                value={Math.round(analytics.totalWords / analytics.totalPages).toLocaleString()}
                                subtitle="Per page"
                                color="blue"
                            />
                            <StatCard
                                title="Avg. Images"
                                value={Math.round(analytics.totalImages / analytics.totalPages)}
                                subtitle="Per page"
                                color="green"
                            />
                            <StatCard
                                title="Readability Score"
                                value={analytics.avgReadability ? Math.round(analytics.avgReadability) : 'N/A'}
                                subtitle="Average"
                                color="purple"
                            />
                        </div>

                        {/* Top Keywords */}
                        <div className="bg-white bg-opacity-10 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Top Keywords</h3>
                            <div className="space-y-2">
                                {analytics.topKeywords.slice(0, 8).map(([keyword, count]) => (
                                    <div key={keyword} className="flex items-center justify-between">
                                        <span className="text-gray-300">{keyword}</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-24 bg-white bg-opacity-20 rounded-full h-2">
                                                <div
                                                    className="h-2 bg-blue-600 rounded-full"
                                                    style={{ width: `${Math.min((count / analytics.topKeywords[0][1]) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-white text-sm">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sentiment Analysis */}
                        {Object.values(analytics.sentimentCounts).some(count => count > 0) && (
                            <div className="bg-white bg-opacity-10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{analytics.sentimentCounts.positive}</div>
                                        <div className="text-sm text-gray-300">Positive</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-400">{analytics.sentimentCounts.neutral}</div>
                                        <div className="text-sm text-gray-300">Neutral</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{analytics.sentimentCounts.negative}</div>
                                        <div className="text-sm text-gray-300">Negative</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="space-y-6">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Avg. Response Time"
                                value={`${Math.round(analytics.avgResponseTime)}ms`}
                                subtitle="Per request"
                                color="blue"
                            />
                            <StatCard
                                title="Fastest Response"
                                value={`${Math.min(...data.map(d => d.responseTime))}ms`}
                                subtitle="Best time"
                                color="green"
                            />
                            <StatCard
                                title="Slowest Response"
                                value={`${Math.max(...data.map(d => d.responseTime))}ms`}
                                subtitle="Worst time"
                                color="red"
                            />
                            <StatCard
                                title="Success Rate"
                                value={`${Math.round((data.length / data.length) * 100)}%`}
                                subtitle="Successful scrapes"
                                color="purple"
                            />
                        </div>

                        {/* Performance Timeline */}
                        <div className="bg-white bg-opacity-10 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Response Time Timeline</h3>
                            <div className="space-y-2">
                                {data.slice(0, 10).map((item, index) => (
                                    <div key={item.id} className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="text-gray-300 text-sm truncate">{item.url}</span>
                                            <span className={`text-sm px-2 py-1 rounded ${item.responseTime < 1000 ? 'bg-green-600' :
                                                    item.responseTime < 3000 ? 'bg-yellow-600' : 'bg-red-600'
                                                } text-white`}>
                                                {item.responseTime}ms
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-6">
                        {/* Key Insights */}
                        <div className="bg-white bg-opacity-10 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                                    <div>
                                        <p className="text-white">Most pages have {analytics.contentLengthRanges.short > analytics.contentLengthRanges.medium ? 'short' : 'medium'} content length</p>
                                        <p className="text-gray-400 text-sm">Consider focusing on pages with more substantial content for better analysis</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                                    <div>
                                        <p className="text-white">Average response time is {Math.round(analytics.avgResponseTime)}ms</p>
                                        <p className="text-gray-400 text-sm">
                                            {analytics.avgResponseTime < 1000 ? 'Excellent performance' :
                                                analytics.avgResponseTime < 3000 ? 'Good performance' : 'Consider optimizing request timeouts'}
                                        </p>
                                    </div>
                                </div>

                                {analytics.topKeywords.length > 0 && (
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                                        <div>
                                            <p className="text-white">Top keyword: "{analytics.topKeywords[0][0]}" appears {analytics.topKeywords[0][1]} times</p>
                                            <p className="text-gray-400 text-sm">This might indicate the main topic or theme across scraped content</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white bg-opacity-10 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 p-3 bg-blue-600 bg-opacity-20 rounded-lg">
                                    <div className="text-blue-400">💡</div>
                                    <p className="text-white text-sm">Enable content analysis to get sentiment and topic insights</p>
                                </div>

                                <div className="flex items-center space-x-3 p-3 bg-green-600 bg-opacity-20 rounded-lg">
                                    <div className="text-green-400">⚡</div>
                                    <p className="text-white text-sm">Focus on high-performing URLs for better data quality</p>
                                </div>

                                <div className="flex items-center space-x-3 p-3 bg-yellow-600 bg-opacity-20 rounded-lg">
                                    <div className="text-yellow-400">📊</div>
                                    <p className="text-white text-sm">Export data in different formats for external analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataAnalysis;