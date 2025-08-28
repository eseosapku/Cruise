import apiService from './api.service';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth.types';
import { ENDPOINTS, SUCCESS_MESSAGES } from '../utils/constants';

class AuthService {

    /**
     * Login user with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await apiService.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);

            // Store auth data in localStorage
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            console.log(SUCCESS_MESSAGES.LOGIN_SUCCESS);
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Register new user
     */
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        try {
            const response = await apiService.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, credentials);

            // Store auth data in localStorage
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            console.log('Registration successful!');
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    logout(): void {
        try {
            // Clear auth data from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            console.log(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser(): User | null {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Get current auth token
     */
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(): Promise<AuthResponse> {
        try {
            const response = await apiService.post<AuthResponse>(ENDPOINTS.AUTH.REFRESH);

            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout(); // Clear invalid auth data
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userData: Partial<User>): Promise<User> {
        try {
            const response = await apiService.put<User>(ENDPOINTS.USERS.PROFILE, userData);

            // Update user data in localStorage
            localStorage.setItem('user', JSON.stringify(response));

            return response;
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
export { authService };