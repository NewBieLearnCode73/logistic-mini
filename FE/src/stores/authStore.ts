import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth.types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  getRole: () => string | null;
  getNodeId: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token: string) =>
        set({ token, isAuthenticated: true }),

      setUser: (user: User) =>
        set({ user }),

      setAuth: (token: string, user: User) =>
        set({ token, user, isAuthenticated: true }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),

      getRole: () => {
        const user = get().user;
        if (!user?.userRoles?.length) return null;
        return user.userRoles[0].role.name;
      },

      getNodeId: () => {
        return get().user?.nodeId ?? null;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
