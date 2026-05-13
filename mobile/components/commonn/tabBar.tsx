import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Heart,
  Home,
  MessageCircle,
  Search,
  UserCircle,
} from "lucide-react-native";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useAuthStore } from "@/store/auth.store";

const TAB_CONFIG = [
  { name: "index", title: "Explore", Icon: Search },
  { name: "saved", title: "Saved", Icon: Heart },
  { name: "trip", title: "Trips", Icon: Home },
  { name: "message", title: "Inbox", Icon: MessageCircle },
  { name: "profile", title: "Profile", Icon: UserCircle },
];

const HIDDEN_TABS = new Set(["[id]", "personal-info"]);

export default function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  const focusedRoute = state.routes[state.index];
  if (focusedRoute && HIDDEN_TABS.has(focusedRoute.name)) {
    return null;
  }

  const visibleRoutes = state.routes.filter((route) => !HIDDEN_TABS.has(route.name));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outer,
        {
          bottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View
        style={[
          styles.shell,
          {
            backgroundColor: colors.BACKGROUND,
            borderColor: colors.BORDER_LIGHT,
            shadowColor: "#000",
          },
        ]}
      >
        {visibleRoutes.map((route) => {
          const globalIndex = state.routes.findIndex((item) => item.key === route.key);
          const isFocused = state.index === globalIndex;
          const config = TAB_CONFIG.find((item) => item.name === route.name);
          if (!config) return null;

          const { title, Icon } = config;

          const onPress = () => {
            if (route.name === "profile" && !isAuthenticated) {
              router.push("/(auth)/login");
              return;
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                descriptors[route.key].options.tabBarAccessibilityLabel
              }
              onPress={onPress}
              style={styles.item}
            >
              <View
                style={[
                  styles.activeShell,
                  !isFocused && styles.inactiveShell,
                  {
                    backgroundColor: isFocused
                      ? colors.PRIMARY
                      : "transparent",
                  },
                  isFocused && {
                    borderColor: colors.PRIMARY_LIGHT,
                    shadowColor: colors.PRIMARY,
                  },
                  styles.iconWrap,
                ]}
              >
                <Icon
                  size={isFocused ? 22 : 18}
                  color={isFocused ? colors.TEXT_WHITE : colors.TEXT_SECONDARY}
                  strokeWidth={isFocused ? 2.4 : 1.9}
                />
              </View>
              {!isFocused ? (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    { color: colors.TEXT_LIGHT },
                  ]}
                >
                  {title}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shell: {
    minHeight: 82,
    width: "94%",
    maxWidth: 420,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 12,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 0,
  },
  activeShell: {
    minWidth: 52,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  inactiveShell: {
    minWidth: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
});
