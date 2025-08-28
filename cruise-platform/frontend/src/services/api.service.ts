import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, ERROR_MESSAGES } from '../utils/constants';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Add timestamp for debugging
                console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                    data: config.data,
                    params: config.params,
                });

                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                    status: response.status,
                    data: response.data,
                });
                return response.data;
            },
            (error: AxiosError) => {
                this.handleResponseError(error);
                return Promise.reject(error);
            }
        );
    }

    private handleResponseError(error: AxiosError): void {
        const { response, request } = error;

        if (response) {
            // Server responded with error status
            const { status, data } = response;
            console.error(`API Error ${status}:`, data);

            switch (status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error(ERROR_MESSAGES.UNAUTHORIZED);
                    break;
                case 404:
                    console.error(ERROR_MESSAGES.NOT_FOUND);
                    break;
                case 422:
                    console.error(ERROR_MESSAGES.VALIDATION_ERROR);
                    break;
                case 500:
                default:
                    console.error(ERROR_MESSAGES.SERVER_ERROR);
                    break;
            }
        } else if (request) {
            // Network error
            console.error(ERROR_MESSAGES.NETWORK_ERROR);
        } else {
            // Other error
            console.error('API Error:', error.message);
        }
    }

    // Generic HTTP methods
    async get<T = any>(url: string, params?: any): Promise<T> {
        return this.api.get(url, { params });
    }

    async post<T = any>(url: string, data?: any): Promise<T> {
        return this.api.post(url, data);
    }

    async put<T = any>(url: string, data?: any): Promise<T> {
        return this.api.put(url, data);
    }

    async patch<T = any>(url: string, data?: any): Promise<T> {
        return this.api.patch(url, data);
    }

    async delete<T = any>(url: string): Promise<T> {
        return this.api.delete(url);
    }

    // Health check
    async healthCheck(): Promise<{ status: string; timestamp: string }> {
        return this.api.get('/health');
    }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;