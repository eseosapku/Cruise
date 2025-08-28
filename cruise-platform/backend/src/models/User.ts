// User interface for TypeScript typing
export interface User {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  company?: string;
  role?: string;
  subscription_plan?: 'free' | 'pro' | 'enterprise';
  subscription_expires_at?: Date;
  is_active?: boolean;
  email_verified?: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_login?: Date;
  login_attempts?: number;
  locked_until?: Date;
  timezone?: string;
  preferences?: any;
  created_at?: Date;
  updated_at?: Date;
}

export default User;