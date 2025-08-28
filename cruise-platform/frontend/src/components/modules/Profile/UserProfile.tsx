import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import useLocalStorage from '../../../hooks/useLocalStorage';

interface UserProfileData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    avatar?: string;
    bio?: string;
    company?: string;
    position?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
    };
    preferences?: {
        theme: 'light' | 'dark' | 'auto';
        language: string;
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        privacy: {
            profileVisible: boolean;
            showEmail: boolean;
            showLocation: boolean;
        };
    };
    stats?: {
        projectsCreated: number;
        pitchDecksGenerated: number;
        lastLogin: string;
        accountCreated: string;
    };
}

const UserProfile: React.FC = () => {
    const { user, updateProfile, loading: authLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security' | 'stats'>('profile');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Form data state
    const [formData, setFormData] = useState<UserProfileData>({
        id: user?.id || '',
        firstName: user?.first_name || user?.name?.split(' ')[0] || '',
        lastName: user?.last_name || user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        username: user?.username || '',
        avatar: user?.profile_picture_url || '',
        bio: '',
        company: '',
        position: '',
        location: '',
        website: '',
        socialLinks: {
            linkedin: '',
            twitter: '',
            github: ''
        },
        preferences: {
            theme: 'auto',
            language: 'en',
            notifications: {
                email: true,
                push: true,
                sms: false
            },
            privacy: {
                profileVisible: true,
                showEmail: false,
                showLocation: true
            }
        },
        stats: {
            projectsCreated: 0,
            pitchDecksGenerated: 0,
            lastLogin: new Date().toISOString(),
            accountCreated: new Date().toISOString()
        }
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Initialize form data when user changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                id: user.id,
                firstName: user.first_name || user.name?.split(' ')[0] || '',
                lastName: user.last_name || user.name?.split(' ')[1] || '',
                email: user.email,
                username: user.username || '',
                avatar: user.profile_picture_url || ''
            }));
        }
    }, [user]);

    const handleInputChange = (field: string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof UserProfileData] as any),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleNestedChange = (parent: string, child: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent as keyof UserProfileData] as any),
                [child]: value
            }
        }));
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setAvatarPreview(result);
                setFormData(prev => ({ ...prev, avatar: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            await updateProfile(formData);
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Simulate password change API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccessMessage('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'stats', label: 'Statistics', icon: '📊' }
    ];

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <img
                                src={avatarPreview || formData.avatar || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=3b82f6&color=fff`}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover border-2 border-white border-opacity-30"
                            />
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                                    <span className="text-white text-xs">📷</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {formData.firstName} {formData.lastName}
                            </h1>
                            <p className="text-gray-300">@{formData.username}</p>
                            {formData.position && formData.company && (
                                <p className="text-gray-400 text-sm">{formData.position} at {formData.company}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setAvatarPreview(null);
                                        setError(null);
                                    }}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-600 bg-opacity-20 border border-red-600 border-opacity-30 rounded-lg p-4">
                    <p className="text-red-200">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-600 bg-opacity-20 border border-green-600 border-opacity-30 rounded-lg p-4">
                    <p className="text-green-200">{successMessage}</p>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white bg-opacity-10 rounded-lg p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
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
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Professional Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Your company"
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                                    <input
                                        type="text"
                                        value={formData.position}
                                        onChange={(e) => handleInputChange('position', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Your job title"
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="City, Country"
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="https://your-website.com"
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 resize-none"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Social Links</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={formData.socialLinks?.linkedin || ''}
                                        onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="LinkedIn profile URL"
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Twitter</label>
                                    <input
                                        type="url"
                                        value={formData.socialLinks?.twitter || ''}
                                        onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Twitter profile URL"
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                                    <input
                                        type="url"
                                        value={formData.socialLinks?.github || ''}
                                        onChange={(e) => handleNestedChange('socialLinks', 'github', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="GitHub profile URL"
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>

                        {/* Theme Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Appearance</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                                <select
                                    value={formData.preferences?.theme || 'auto'}
                                    onChange={(e) => handleNestedChange('preferences', 'theme', e.target.value)}
                                    className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                                <select
                                    value={formData.preferences?.language || 'en'}
                                    onChange={(e) => handleNestedChange('preferences', 'language', e.target.value)}
                                    className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                </select>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Notifications</h3>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.preferences?.notifications?.email || false}
                                        onChange={(e) => handleNestedChange('preferences.notifications', 'email', e.target.checked)}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-white">Email notifications</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.preferences?.notifications?.push || false}
                                        onChange={(e) => handleNestedChange('preferences.notifications', 'push', e.target.checked)}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-white">Push notifications</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.preferences?.notifications?.sms || false}
                                        onChange={(e) => handleNestedChange('preferences.notifications', 'sms', e.target.checked)}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-white">SMS notifications</span>
                                </label>
                            </div>
                        </div>

                        {/* Privacy Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Privacy</h3>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.preferences?.privacy?.profileVisible || false}
                                        onChange={(e) => handleNestedChange('preferences.privacy', 'profileVisible', e.target.checked)}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-white">Make profile visible to others</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.preferences?.privacy?.showEmail || false}
                                        onChange={(e) => handleNestedChange('preferences.privacy', 'showEmail', e.target.checked)}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-white">Show email address</span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.preferences?.privacy?.showLocation || false}
                                        onChange={(e) => handleNestedChange('preferences.privacy', 'showLocation', e.target.checked)}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-white">Show location</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleSaveProfile}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>

                        {/* Password Change */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Change Password</h3>

                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <button
                                    onClick={handlePasswordChange}
                                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </div>

                        {/* Account Security */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Account Security</h3>

                            <div className="bg-white bg-opacity-10 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">Two-Factor Authentication</p>
                                        <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                                    </div>
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                        Enable
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">Login Notifications</p>
                                        <p className="text-gray-400 text-sm">Get notified when someone logs into your account</p>
                                    </div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="rounded text-blue-600"
                                        />
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">Session Management</p>
                                        <p className="text-gray-400 text-sm">View and manage your active sessions</p>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Account Statistics</h2>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-400">{formData.stats?.projectsCreated || 0}</div>
                                <div className="text-sm text-gray-300">Projects Created</div>
                            </div>

                            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-400">{formData.stats?.pitchDecksGenerated || 0}</div>
                                <div className="text-sm text-gray-300">Pitch Decks</div>
                            </div>

                            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-purple-400">0</div>
                                <div className="text-sm text-gray-300">AI Sessions</div>
                            </div>

                            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-400">0</div>
                                <div className="text-sm text-gray-300">Web Scrapes</div>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="bg-white bg-opacity-10 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Account Created</span>
                                    <span className="text-white">
                                        {new Date(formData.stats?.accountCreated || '').toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-300">Last Login</span>
                                    <span className="text-white">
                                        {new Date(formData.stats?.lastLogin || '').toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-300">Account Status</span>
                                    <span className="text-green-400">Active</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-300">Subscription</span>
                                    <span className="text-blue-400">Free Plan</span>
                                </div>
                            </div>
                        </div>

                        {/* Activity Summary */}
                        <div className="bg-white bg-opacity-10 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <span className="text-gray-300 text-sm">Profile updated</span>
                                    <span className="text-gray-400 text-xs ml-auto">Just now</span>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    <span className="text-gray-300 text-sm">Account created</span>
                                    <span className="text-gray-400 text-xs ml-auto">
                                        {new Date(formData.stats?.accountCreated || '').toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;