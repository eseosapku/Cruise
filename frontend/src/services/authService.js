import apiService from './apiService';

class AuthService {
  async login(email, password) {
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    }
  }

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Decode JWT to get user info (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        throw new Error('Token expired');
      }

      return {
        id: payload.userId,
        email: payload.email
      };
    } catch (error) {
      throw error;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();
