import apiService from './api.service';
import { ENDPOINTS, SUCCESS_MESSAGES } from '../utils/constants';
import { User } from '../types/auth.types';

// User-related interfaces
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    role?: string;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_picture_url?: string;
    company?: string;
    role?: string;
    timezone?: string;
    preferences?: any;
}

export interface UserProfile extends User {
    // Additional profile fields
    bio?: string;
    website?: string;
    social_links?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
    };
    settings?: {
        notifications?: boolean;
        darkMode?: boolean;
        language?: string;
    };
}

export interface UsersListResponse {
    success: boolean;
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class UserService {

    /**
     * Get current user profile
     */
    async getProfile(): Promise<UserProfile> {
        try {
            const response = await apiService.get<UserProfile>(ENDPOINTS.USERS.PROFILE);
            return response;
        } catch (error) {
            console.error('Failed to get user profile:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userData: UpdateUserRequest): Promise<UserProfile> {
        try {
            const response = await apiService.put<UserProfile>(
                ENDPOINTS.USERS.UPDATE,
                userData
            );

            // Update localStorage with new user data
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...response };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            console.log(SUCCESS_MESSAGES.PROFILE_UPDATED);
            return response;
        } catch (error) {
            console.error('Failed to update user profile:', error);
            throw error;
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<User> {
        try {
            const response = await apiService.get<User>(`${ENDPOINTS.USERS.BASE}/${id}`);
            return response;
        } catch (error) {
            console.error('Failed to get user by ID:', error);
            throw error;
        }
    }

    /**
     * Get all users (admin function)
     */
    async getAllUsers(page: number = 1, limit: number = 10): Promise<UsersListResponse> {
        try {
            const response = await apiService.get<UsersListResponse>(
                ENDPOINTS.USERS.BASE,
                { page, limit }
            );
            return response;
        } catch (error) {
            console.error('Failed to get all users:', error);
            throw error;
        }
    }

    /**
     * Create new user (admin function)
     */
    async createUser(userData: CreateUserRequest): Promise<User> {
        try {
            const response = await apiService.post<User>(
                ENDPOINTS.USERS.BASE,
                userData
            );

            console.log('User created successfully');
            return response;
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    }

    /**
     * Delete user (admin function)
     */
    async deleteUser(id: string): Promise<void> {
        try {
            await apiService.delete(`${ENDPOINTS.USERS.BASE}/${id}`);
            console.log('User deleted successfully');
        } catch (error) {
            console.error('Failed to delete user:', error);
            throw error;
        }
    }

    /**
     * Update user settings
     */
    async updateSettings(settings: any): Promise<UserProfile> {
        try {
            const response = await apiService.patch<UserProfile>(
                ENDPOINTS.USERS.PROFILE,
                { settings }
            );

            // Update localStorage
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, settings: response.settings };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            console.log('Settings updated successfully');
            return response;
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    }

    /**
     * Upload profile picture
     */
    async uploadProfilePicture(file: File): Promise<{ url: string }> {
        try {
            const formData = new FormData();
            formData.append('profile_picture', file);

            const response = await apiService.post<{ url: string }>(
                `${ENDPOINTS.USERS.PROFILE}/picture`,
                formData
            );

            console.log('Profile picture uploaded successfully');
            return response;
        } catch (error) {
            console.error('Failed to upload profile picture:', error);
            throw error;
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        try {
            await apiService.post(
                `${ENDPOINTS.USERS.PROFILE}/change-password`,
                { currentPassword, newPassword }
            );

            console.log('Password changed successfully');
        } catch (error) {
            console.error('Failed to change password:', error);
            throw error;
        }
    }

    /**
     * Get user statistics/analytics
     */
    async getUserStats(): Promise<any> {
        try {
            const response = await apiService.get(`${ENDPOINTS.USERS.PROFILE}/stats`);
            return response;
        } catch (error) {
            console.error('Failed to get user stats:', error);
            throw error;
        }
    }

    /**
     * Deactivate account
     */
    async deactivateAccount(): Promise<void> {
        try {
            await apiService.post(`${ENDPOINTS.USERS.PROFILE}/deactivate`);

            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            console.log('Account deactivated successfully');
        } catch (error) {
            console.error('Failed to deactivate account:', error);
            throw error;
        }
    }
}

// Create singleton instance
const userService = new UserService();

export default userService;
export { userService };