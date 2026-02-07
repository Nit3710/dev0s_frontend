import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { devosApi } from '@/api/devos.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await devosApi.login(token);
          if (response.data?.valid) {
            const user: User = {
              id: 'user_1',
              workspaceToken: token,
              createdAt: new Date(),
            };
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          } else {
            set({ error: 'Invalid token', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ error: 'Authentication failed', isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      checkAuth: () => {
        const { user } = get();
        if (user) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'devos-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
