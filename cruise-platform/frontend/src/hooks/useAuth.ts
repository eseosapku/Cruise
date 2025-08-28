import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import authService from '../services/auth.service';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    updateProfile: (userData: Partial<User>) => Promise<void>;
    refreshToken: () => Promise<void>;
    clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useLocalStorage('user', null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user is authenticated
    const isAuthenticated = Boolean(user && authService.getToken());

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const currentUser = authService.getCurrentUser();
                const token = authService.getToken();

                if (currentUser && token) {
                    setUser(currentUser);
                } else {
                    // Clear invalid auth data
                    authService.logout();
                    setUser(null);
                }
            } catch (err) {
                console.error('Error initializing auth:', err);
                authService.logout();
                setUser(null);
            }
        };

        initializeAuth();
    }, [setUser]);

    // Login function
    const login = useCallback(async (credentials: LoginCredentials) => {
        setLoading(true);
        setError(null);

        try {
            const response: AuthResponse = await authService.login(credentials);
            setUser(response.user);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    // Register function
    const register = useCallback(async (credentials: RegisterCredentials) => {
        setLoading(true);
        setError(null);

        try {
            const response: AuthResponse = await authService.register(credentials);
            setUser(response.user);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Registration failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    // Logout function
    const logout = useCallback(() => {
        try {
            authService.logout();
            setUser(null);
            setError(null);
        } catch (err: any) {
            console.error('Logout error:', err);
            // Force logout even if there's an error
            setUser(null);
        }
    }, [setUser]);

    // Update profile function
    const updateProfile = useCallback(async (userData: Partial<User>) => {
        setLoading(true);
        setError(null);

        try {
            const updatedUser = await authService.updateProfile(userData);
            setUser(updatedUser);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Profile update failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    // Refresh token function
    const refreshToken = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response: AuthResponse = await authService.refreshToken();
            setUser(response.user);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Token refresh failed';
            setError(errorMessage);
            // If refresh fails, logout user
            logout();
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setUser, logout]);

    // Auto-refresh token when it's about to expire
    useEffect(() => {
        if (!isAuthenticated) return;

        const token = authService.getToken();
        if (!token) return;

        // Check token expiration and refresh if needed
        const checkTokenExpiration = () => {
            try {
                // Decode token to check expiration (basic implementation)
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const currentTime = Math.floor(Date.now() / 1000);
                    const timeUntilExpiry = payload.exp - currentTime;

                    // Refresh token if it expires in less than 5 minutes
                    if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
                        refreshToken().catch(console.error);
                    }
                }
            } catch (err) {
                console.error('Error checking token expiration:', err);
            }
        };

        // Check immediately and then every 5 minutes
        checkTokenExpiration();
        const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated, refreshToken]);

    return {
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        refreshToken,
        clearError,
    };
};

export default useAuth;