import { create } from "zustand";
import { api } from "../api/api";
import { ENDPOINTS } from "@/api/endpoints";
import type { AxiosError } from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string | null;
  role?: "guest" | "host" | "admin";
  hostStatus?: string;
  avatar?: string | null;
  bio?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: {
    name: string;
    username?: string;
    phone?: string;
    bio?: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const response = await api.get<{ user: User }>(ENDPOINTS.AUTH.ME);
      set({ user: response.data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      set({ isAuthenticated: true, user: response.data.user });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false });

    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status !== 401) {
        throw error;
      }
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const username =
        email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || name;
      await api.post(ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        username,
        password,
      });
      await api.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      set({ isAuthenticated: true, user: response.data.user });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true });
    try {
      const response = await api.patch<User>(ENDPOINTS.AUTH.UPDATE_PROFILE, {
        name: data.name,
        username: data.username,
        phone: data.phone,
        bio: data.bio,
      });
      set({ user: response.data, isAuthenticated: true });
    } finally {
      set({ loading: false });
    }
  },
}));
