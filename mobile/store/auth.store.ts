import { create } from "zustand";
import { api } from "../api/api";
import { ENDPOINTS } from "@/api/endpoints";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const response = await api.get(ENDPOINTS.AUTH.ME);
      set({ user: response.data, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      await api.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      await get().fetchUser();
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password,
      });
      set({ user: response.data, isAuthenticated: true });
    } finally {
      set({ loading: false });
    }
  },
}));
