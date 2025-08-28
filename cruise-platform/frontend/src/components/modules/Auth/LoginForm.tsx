import React, { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { LoginCredentials } from '../../../types/auth.types';

interface LoginFormProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
    onSuccess,
    onError,
    className = ''
}) => {
    const { login, loading } = useAuth();
    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await login(formData);
            onSuccess?.();
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Login failed';
            onError?.(errorMessage);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Sign In</h3>
                <p className="text-blue-200">Welcome back to Cruise Platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Enter your email"
                        disabled={loading}
                    />
                    {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-300">{validationErrors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Enter your password"
                        disabled={loading}
                    />
                    {validationErrors.password && (
                        <p className="mt-1 text-sm text-red-300">{validationErrors.password}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div className="text-center">
                <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                    Forgot your password?
                </a>
            </div>
        </div>
    );
};

export default LoginForm;