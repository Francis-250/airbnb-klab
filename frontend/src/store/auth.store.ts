import { create } from "zustand";
import { api } from "../lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  phone?: string;
  role: string;
  hostStatus?: "pending" | "approved" | "restricted";
  avatar?: string;
  bio?: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string,
    role?: "guest" | "host",
  ) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  login: async (email, password) => {
    const { fetchUser } = useAuthStore.getState();
    await api.post("/auth/login", { email, password });
    await fetchUser();
  },
  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },
  register: async (name, username, email, password, role = "guest") => {
    await api.post("/auth/register", { name, username, email, password, role });
  },
}));
