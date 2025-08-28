import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { userService } from '../services/user.service';
import { User } from '../types/user.types';
import Loading from '../components/common/Loading';

const Profile: React.FC = () => {
    const { user: authUser, loading: authLoading, logout } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        role: ''
    });

    useEffect(() => {
        if (authUser) {
            loadUserProfile();
        }
    }, [authUser]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const profile = await userService.getProfile();
            setUser(profile as User);
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                company: profile.company || '',
                role: profile.role || ''
            });
        } catch (err: any) {
            console.error('Failed to load profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const updatedProfile = await userService.updateProfile(formData);
            setUser(updatedProfile as User);
            setIsEditing(false);
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (authLoading || (loading && !user)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading size="large" message="Loading profile..." />
            </div>
        );
    }

    if (!authUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
                    <p className="text-blue-200">Please log in to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-animated p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <h1 className="text-4xl font-bold text-white mb-3 gradient-text flex items-center">
                        <span className="mr-3">👤</span>
                        User Profile
                    </h1>
                    <p className="text-blue-200 text-lg">
                        Manage your account settings and preferences
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

                {/* Profile Information */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <span className="mr-3">📋</span>
                            Profile Information
                        </h2>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                        >
                            {isEditing ? '✖️ Cancel' : '✏️ Edit Profile'}
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-white mb-3">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-white mb-3">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="company" className="block text-sm font-semibold text-white mb-3">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your company"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-semibold text-white mb-3">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your role"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? '💾 Saving...' : '💾 Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    ✖️ Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glassmorphism rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-blue-200 mb-3">Full Name</h3>
                                <p className="text-white text-xl">{user?.name || 'Not provided'}</p>
                            </div>
                            <div className="glassmorphism rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-blue-200 mb-3">Email</h3>
                                <p className="text-white text-xl">{user?.email || 'Not provided'}</p>
                            </div>
                            <div className="glassmorphism rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-blue-200 mb-3">Company</h3>
                                <p className="text-white text-xl">{(user as any)?.company || 'Not provided'}</p>
                            </div>
                            <div className="glassmorphism rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-blue-200 mb-3">Role</h3>
                                <p className="text-white text-xl">{(user as any)?.role || 'Not provided'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Settings */}
                <div className="glassmorphism rounded-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <span className="mr-3">⚙️</span>
                        Account Settings
                    </h2>
                    <div className="space-y-6">
                        <div className="glassmorphism rounded-xl p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-white font-semibold text-lg">Account Status</h3>
                                <p className="text-blue-200">Your account is active and verified</p>
                            </div>
                            <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full">
                                ✅ Active
                            </span>
                        </div>

                        <div className="glassmorphism rounded-xl p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-white font-semibold text-lg">Member Since</h3>
                                <p className="text-blue-200">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : 'Unknown'
                                    }
                                </p>
                            </div>
                            <span className="text-blue-300 text-2xl">🗓️</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-red-300 mb-6 flex items-center">
                        <span className="mr-3">⚠️</span>
                        Danger Zone
                    </h2>
                    <div className="glassmorphism rounded-xl p-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-red-300 font-semibold text-lg">Sign Out</h3>
                            <p className="text-red-200">Sign out from your current session</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                        >
                            🚪 Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;