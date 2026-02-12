import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setCredentials: (user: User, accessToken: string) => void;
  clearCredentials: () => void;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setCredentials: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),

  clearCredentials: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
