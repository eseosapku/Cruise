import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
                <div className="glassmorphism-card-premium p-16 max-w-7xl mx-auto shadow-2xl">
                    <div className="mb-12">
                        <h1 className="text-7xl font-extrabold text-white mb-8 gradient-text leading-tight">
                            Welcome to Cruise Platform
                        </h1>
                        <p className="text-2xl glassmorphism-text mb-16 max-w-4xl mx-auto leading-relaxed font-medium">
                            Your AI-powered entrepreneurship accelerator. Create stunning pitch decks with advanced AI,
                            analyze markets with web scraping, and automate LinkedIn outreach - all in one platform.
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        <Link to="/pitch-deck" className="glassmorphism-animated p-8 transition-all duration-300 group">
                            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🎯</div>
                            <h3 className="glassmorphism-heading text-xl mb-4">AI Pitch Decks</h3>
                            <p className="glassmorphism-text leading-relaxed">
                                Generate professional presentations with Genspark-style AI workflow and market research
                            </p>
                            <div className="mt-6 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        </Link>

                        <Link to="/ai-assistant" className="glassmorphism-animated p-8 transition-all duration-300 group">
                            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
                            <h3 className="glassmorphism-heading text-xl mb-4">AI Assistant</h3>
                            <p className="glassmorphism-text leading-relaxed">
                                Conversational AI for business strategy, content creation, and intelligent insights
                            </p>
                            <div className="mt-6 h-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                        </Link>

                        <Link to="/web-scraper" className="glassmorphism-animated p-8 transition-all duration-300 group">
                            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🔍</div>
                            <h3 className="glassmorphism-heading text-xl mb-4">Web Scraping</h3>
                            <p className="glassmorphism-text leading-relaxed">
                                Advanced data extraction and comprehensive market research tools with AI analysis
                            </p>
                            <div className="mt-6 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                        </Link>

                        <Link to="/linkedin" className="glassmorphism-animated p-8 transition-all duration-300 group">
                            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">💼</div>
                            <h3 className="glassmorphism-heading text-xl mb-4">LinkedIn Outreach</h3>
                            <p className="glassmorphism-text leading-relaxed">
                                Automated networking and intelligent lead generation campaigns with personalization
                            </p>
                            <div className="mt-6 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
                        </Link>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/pitch-deck"
                            className="glassmorphism-button text-white font-bold text-xl rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl group-hover:animate-bounce">🚀</span>
                                <span>Create AI Pitch Deck</span>
                            </div>
                        </Link>
                        <Link
                            to="/dashboard"
                            className="glassmorphism-button text-white font-bold text-xl rounded-3xl transition-all duration-300 transform hover:scale-105"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl group-hover:animate-bounce">📊</span>
                                <span>Explore Dashboard</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Stats section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    <div className="glassmorphism-card-premium p-10 text-center transition-all duration-300">
                        <div className="glassmorphism-heading text-4xl mb-4 gradient-text-primary">AI-Powered</div>
                        <div className="glassmorphism-text text-lg leading-relaxed">Advanced algorithms for intelligent content generation and strategic insights</div>
                        <div className="mt-6 text-4xl">🤖</div>
                    </div>
                    <div className="glassmorphism-card-premium p-10 text-center transition-all duration-300">
                        <div className="glassmorphism-heading text-4xl mb-4 gradient-text-primary">Professional</div>
                        <div className="glassmorphism-text text-lg leading-relaxed">Enterprise-grade design and functionality for serious business needs</div>
                        <div className="mt-6 text-4xl">💼</div>
                    </div>
                    <div className="glassmorphism-card-premium p-10 text-center transition-all duration-300">
                        <div className="glassmorphism-heading text-4xl mb-4 gradient-text-primary">Integrated</div>
                        <div className="glassmorphism-text text-lg leading-relaxed">All-in-one entrepreneurship platform with seamless workflow automation</div>
                        <div className="mt-6 text-4xl">🔗</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
