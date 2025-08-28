// Auth request interfaces matching backend
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Auth response interfaces matching backend
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  company?: string;
  role?: string;
  subscription_plan?: 'free' | 'pro' | 'enterprise';
  subscription_expires_at?: Date;
  is_active?: boolean;
  email_verified?: boolean;
  last_login?: Date;
  timezone?: string;
  preferences?: any;
  created_at?: Date;
  updated_at?: Date;
}

// Legacy interfaces for backward compatibility
export interface AuthCredentials extends LoginCredentials { }
export interface RegisterData extends RegisterCredentials { }
export interface LoginData extends LoginCredentials { }