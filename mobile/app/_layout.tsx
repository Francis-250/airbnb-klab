import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useThemeColors } from "@/hooks/useThemeColors";

const queryClient = new QueryClient();

export default function RootLayout() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const { colors, isDark } = useThemeColors();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={colors.BACKGROUND}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </QueryClientProvider>
  );
}
