import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email?: string;
  full_name: string | null;
  avatar_url?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) => {
        // Direct localStorage write required by api.ts interceptor
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        set({ user, token, refreshToken: refreshToken || null });
      },
      setTokens: (token, refreshToken) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refreshToken);
        set({ token, refreshToken });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        set({ user: null, token: null, refreshToken: null });
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
