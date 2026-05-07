import { createContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await api.get("/auth/me");
        return res.data.user;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await api.post("/auth/login", { email, password });
      return res.data.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["auth", "me"], userData);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({
      name,
      username,
      email,
      password,
    }: {
      name: string;
      username: string;
      email: string;
      password: string;
    }) => {
      await api.post("/auth/register", { name, username, email, password });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
      return null;
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => {
    await registerMutation.mutateAsync({ name, username, email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{ user: user || null, loading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
