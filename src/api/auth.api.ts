import { apiClient } from './client';
import { User } from '@/types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
  };
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response;
  },

  // Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response;
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', null, {
      params: { refreshToken }
    });
    return response;
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  // Get current user
  async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response;
  },

  // Update profile
  async updateProfile(userData: Partial<UserResponse>): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>('/auth/profile', userData);
    return response;
  },

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword
    });
  }
};
