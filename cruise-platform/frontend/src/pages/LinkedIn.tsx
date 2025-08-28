import React, { useState } from 'react';
import CampaignBuilder from '../components/modules/LinkedIn/CampaignBuilder';
import ProfileSearch from '../components/modules/LinkedIn/ProfileSearch';
import MessageTemplates from '../components/modules/LinkedIn/MessageTemplates';

const LinkedInPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'search' | 'templates'>('campaigns');

    return (
        <div className="min-h-screen bg-gradient-animated p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <h1 className="text-4xl font-bold text-white mb-3 gradient-text flex items-center">
                        <span className="mr-3">💼</span>
                        LinkedIn Automation
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Automate your LinkedIn outreach, build campaigns, and manage professional networking
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="glassmorphism rounded-2xl p-2 mb-8">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'campaigns'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                    : 'text-white hover:bg-white hover:bg-opacity-10'
                                }`}
                        >
                            🚀 Campaign Builder
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'search'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                    : 'text-white hover:bg-white hover:bg-opacity-10'
                                }`}
                        >
                            🔍 Profile Search
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'templates'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                    : 'text-white hover:bg-white hover:bg-opacity-10'
                                }`}
                        >
                            📝 Message Templates
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="glassmorphism rounded-2xl p-8 min-h-[600px]">
                    {activeTab === 'campaigns' && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="mr-3">🚀</span>
                                Campaign Builder
                            </h2>
                            <CampaignBuilder />
                        </div>
                    )}

                    {activeTab === 'search' && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="mr-3">🔍</span>
                                Profile Search
                            </h2>
                            <ProfileSearch />
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <span className="mr-3">📝</span>
                                Message Templates
                            </h2>
                            <MessageTemplates />
                        </div>
                    )}
                </div>

                {/* Feature Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glassmorphism rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 group">
                        <div className="text-4xl mb-4 group-hover:animate-bounce">🎯</div>
                        <h3 className="text-xl font-bold text-white mb-3">Targeted Outreach</h3>
                        <p className="text-blue-200">
                            Find and connect with prospects based on specific criteria and industry filters
                        </p>
                    </div>

                    <div className="glassmorphism rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 group">
                        <div className="text-4xl mb-4 group-hover:animate-bounce">🤖</div>
                        <h3 className="text-xl font-bold text-white mb-3">AI Personalization</h3>
                        <p className="text-blue-200">
                            Generate personalized messages using AI based on prospect's profile and activity
                        </p>
                    </div>

                    <div className="glassmorphism rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 group">
                        <div className="text-4xl mb-4 group-hover:animate-bounce">📊</div>
                        <h3 className="text-xl font-bold text-white mb-3">Campaign Analytics</h3>
                        <p className="text-blue-200">
                            Track response rates, connection acceptance, and campaign performance metrics
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkedInPage;