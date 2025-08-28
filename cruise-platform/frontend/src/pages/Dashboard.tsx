import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/user.service';
import { aiService } from '../services/ai.service';
import { pitchDeckService } from '../services/pitchdeck.service';
import { User } from '../types/user.types';
import DashboardCard from '../components/modules/Dashboard/DashboardCard';
import ProjectList from '../components/modules/Dashboard/ProjectList';
import Loading from '../components/common/Loading';

interface DashboardStats {
    totalProjects: number;
    recentAIQueries: number;
    activePitchDecks: number;
    lastActivity: string;
}

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load user profile
            const userProfile = await userService.getProfile();
            setUser(userProfile as User);

            // Load dashboard statistics
            const [pitchDecksResponse] = await Promise.allSettled([
                pitchDeckService.getPitchDecks()
            ]);

            const totalProjects = pitchDecksResponse.status === 'fulfilled'
                ? pitchDecksResponse.value.length
                : 0;

            setStats({
                totalProjects,
                recentAIQueries: 0, // Will be populated when AI history is available
                activePitchDecks: totalProjects,
                lastActivity: new Date().toLocaleDateString()
            });

        } catch (err: any) {
            console.error('Failed to load dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading size="large" message="Loading dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={loadDashboardData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-animated p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 gradient-text">
                        Welcome back, {user?.name || 'User'}! 🚀
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Here's what's happening with your projects today.
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="glassmorphism rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-sm font-medium">Total Projects</p>
                                <p className="text-3xl font-bold text-white">{stats?.totalProjects || '0'}</p>
                            </div>
                            <div className="text-blue-400 text-2xl">📊</div>
                        </div>
                    </div>

                    <div className="glassmorphism rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-sm font-medium">Active Pitch Decks</p>
                                <p className="text-3xl font-bold text-white">{stats?.activePitchDecks || '0'}</p>
                            </div>
                            <div className="text-blue-400 text-2xl">🎯</div>
                        </div>
                    </div>

                    <div className="glassmorphism rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-sm font-medium">AI Queries</p>
                                <p className="text-3xl font-bold text-white">{stats?.recentAIQueries || '0'}</p>
                            </div>
                            <div className="text-blue-400 text-2xl">🤖</div>
                        </div>
                    </div>

                    <div className="glassmorphism rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-sm font-medium">Last Activity</p>
                                <p className="text-xl font-bold text-white">{stats?.lastActivity || 'Today'}</p>
                            </div>
                            <div className="text-blue-400 text-2xl">⏰</div>
                        </div>
                    </div>
                </div>

                {/* Project List */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <span className="mr-3">📋</span>
                        Recent Projects
                    </h2>
                    <ProjectList />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glassmorphism rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 group">
                        <div className="text-4xl mb-4 group-hover:animate-bounce">🚀</div>
                        <h3 className="text-xl font-bold text-white mb-3">Create New Pitch Deck</h3>
                        <p className="text-blue-200 mb-6">Generate AI-powered presentations with Genspark workflow</p>
                        <Link
                            to="/pitch-deck"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110"
                        >
                            Start Creating
                        </Link>
                    </div>

                    <div className="glassmorphism rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 group">
                        <div className="text-4xl mb-4 group-hover:animate-bounce">🧠</div>
                        <h3 className="text-xl font-bold text-white mb-3">AI Assistant</h3>
                        <p className="text-blue-200 mb-6">Get intelligent help with content creation and strategy</p>
                        <Link
                            to="/ai-assistant"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-110"
                        >
                            Ask AI
                        </Link>
                    </div>

                    <div className="glassmorphism rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 group">
                        <div className="text-4xl mb-4 group-hover:animate-bounce">🔍</div>
                        <h3 className="text-xl font-bold text-white mb-3">Web Scraper</h3>
                        <p className="text-blue-200 mb-6">Research and gather data from any website</p>
                        <Link
                            to="/web-scraper"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-110"
                        >
                            Start Scraping
                        </Link>
                    </div>
                </div>

                {/* Additional Features */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glassmorphism rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <span className="mr-2">💼</span>
                            LinkedIn Automation
                        </h3>
                        <p className="text-blue-200 mb-4">Automate your LinkedIn outreach and networking</p>
                        <Link
                            to="/linkedin"
                            className="text-blue-300 hover:text-white transition-colors font-medium"
                        >
                            Explore LinkedIn Tools →
                        </Link>
                    </div>

                    <div className="glassmorphism rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <span className="mr-2">👤</span>
                            Profile Settings
                        </h3>
                        <p className="text-blue-200 mb-4">Manage your account and preferences</p>
                        <Link
                            to="/profile"
                            className="text-blue-300 hover:text-white transition-colors font-medium"
                        >
                            View Profile →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;