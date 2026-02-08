import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi, LoginRequest, RegisterRequest } from '@/api/auth.api';
import { apiClient } from '@/api/client';
import { useToastStore } from '@/state/toast.store';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        console.log('Login attempt started for:', credentials.username);
        set({ isLoading: true, error: null });
        const toast = useToastStore.getState();
        
        try {
          const response = await authApi.login(credentials);
          console.log('Login API response received:', response);
          
          // Set JWT token in API client
          apiClient.setToken(response.token);
          
          const user: User = {
            id: response.user.id,
            email: response.user.email,
            workspaceToken: response.token,
            createdAt: new Date(response.user.createdAt || Date.now()),
          };
          
          console.log('Setting auth state:', { user, isAuthenticated: true });
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
          
          console.log('Login completed successfully');
          return true;
        } catch (error: any) {
          console.error('Login failed:', error);
          
          // Handle validation errors specifically
          if (error.response?.data?.validationErrors) {
            const validationErrors = error.response.data.validationErrors;
            const firstError = Object.values(validationErrors)[0];
            toast.error(String(firstError) || 'Validation failed');
          } else {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            toast.error(errorMessage);
          }
          
          set({ 
            error: error.response?.data?.message || error.message || 'Login failed', 
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          return false;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        const toast = useToastStore.getState();
        
        try {
          const response = await authApi.register(userData);
          
          // Set JWT token in API client
          apiClient.setToken(response.token);
          
          const user: User = {
            id: response.user.id,
            email: response.user.email,
            workspaceToken: response.token,
            createdAt: new Date(response.user.createdAt || Date.now()),
          };
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
          
          return true;
        } catch (error: any) {
          console.error('Registration failed:', error);
          
          // Handle validation errors specifically
          if (error.response?.data?.validationErrors) {
            const validationErrors = error.response.data.validationErrors;
            const firstError = Object.values(validationErrors)[0];
            toast.error(String(firstError) || 'Validation failed');
          } else {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            toast.error(errorMessage);
          }
          
          set({ 
            error: error.response?.data?.message || error.message || 'Registration failed', 
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          return false;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear token and reset state regardless of API call success
          apiClient.clearToken();
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null,
            isLoading: false
          });
        }
      },

      checkAuth: () => {
        console.log('checkAuth called');
        const token = apiClient.loadToken();
        console.log('Token from storage:', token ? 'exists' : 'none');
        
        if (token) {
          apiClient.setToken(token);
          console.log('Token set, validating with backend...');
          // Optionally validate token with backend
          authApi.getCurrentUser()
            .then(userResponse => {
              console.log('User validation response:', userResponse);
              const user: User = {
                id: userResponse.id,
                email: userResponse.email,
                workspaceToken: token,
                createdAt: new Date(userResponse.createdAt),
              };
              set({ 
                user, 
                isAuthenticated: true,
                error: null
              });
              console.log('User authenticated from stored token');
            })
            .catch((error) => {
              console.error('Token validation failed:', error);
              // Token is invalid, clear it
              apiClient.clearToken();
              set({ 
                user: null, 
                isAuthenticated: false,
                error: null
              });
            });
        } else {
          console.log('No token found, user not authenticated');
        }
      },

      refreshToken: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const response = await authApi.refreshToken(user.workspaceToken);
          apiClient.setToken(response.token);
          
          set({
            user: {
              ...user,
              workspaceToken: response.token
            }
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Force logout on refresh failure
          get().logout();
        }
      },
    }),
    {
      name: 'devos-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
