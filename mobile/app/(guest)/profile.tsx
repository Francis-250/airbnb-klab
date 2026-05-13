import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CreditCard,
  Globe2,
  Lock,
  LogOut,
  Moon,
  Sun,
  UserCircle,
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { COLORS } from "@/constants/colors";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useThemeStore } from "@/store/theme.store";

const settings = [
  { label: "Personal information", icon: UserCircle },
  { label: "Payments and payouts", icon: CreditCard },
  { label: "Translation", icon: Globe2 },
  { label: "Notifications", icon: Bell },
  { label: "Privacy and sharing", icon: Lock },
  { label: "Travel for work", icon: BriefcaseBusiness },
];

export default function Profile() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { colors, isDark, preference } = useThemeColors();
  const cyclePreference = useThemeStore((state) => state.cyclePreference);
  const themeLabel =
    preference === "system"
      ? `System (${isDark ? "Dark" : "Light"})`
      : preference;

  const handleLogout = async () => {
    await logout();
    router.replace("/(guest)");
  };

  const showComingSoon = (label: string) => {
    Alert.alert(label, "This setting is coming soon.");
  };

  const handleSettingPress = (item: (typeof settings)[number]) => {
    if (item.label === "Personal information") {
      router.push("/(guest)/personal-info");
      return;
    }

    showComingSoon(item.label);
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.profileHeader}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: isDark ? "#2B2440" : "#E8DEFF" },
              ]}
            >
              <UserCircle size={34} color="#5F4B8B" />
            </View>
          )}

          <Text style={[styles.name, { color: colors.TEXT_PRIMARY }]}>
            {user?.name || "Guest"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
            Account Settings
          </Text>
          <View style={[styles.rows, { borderColor: colors.BORDER_LIGHT }]}>
            <Pressable
              onPress={cyclePreference}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: colors.BACKGROUND,
                  borderColor: colors.BORDER_LIGHT,
                },
                pressed && { backgroundColor: colors.BACKGROUND_GRAY },
              ]}
            >
              {isDark ? (
                <Moon size={18} color={colors.TEXT_PRIMARY} strokeWidth={1.8} />
              ) : (
                <Sun size={18} color={colors.TEXT_PRIMARY} strokeWidth={1.8} />
              )}
              <Text style={[styles.rowLabel, { color: colors.TEXT_PRIMARY }]}>
                Theme
              </Text>
              <Text
                style={[styles.themeValue, { color: colors.TEXT_SECONDARY }]}
              >
                {themeLabel}
              </Text>
            </Pressable>
            {settings.map((item) => {
              const Icon = item.icon;

              return (
                <Pressable
                  key={item.label}
                  onPress={() => handleSettingPress(item)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: colors.BACKGROUND,
                      borderColor: colors.BORDER_LIGHT,
                    },
                    pressed && { backgroundColor: colors.BACKGROUND_GRAY },
                  ]}
                >
                  <Icon
                    size={18}
                    color={colors.TEXT_PRIMARY}
                    strokeWidth={1.8}
                  />
                  <Text
                    style={[styles.rowLabel, { color: colors.TEXT_PRIMARY }]}
                  >
                    {item.label}
                  </Text>
                  <ChevronRight
                    size={20}
                    color={colors.TEXT_PRIMARY}
                    strokeWidth={2.2}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutRow,
            { borderColor: colors.BORDER_LIGHT },
            pressed && { backgroundColor: colors.BACKGROUND_GRAY },
          ]}
        >
          <LogOut size={18} color={COLORS.PRIMARY} strokeWidth={1.9} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingTop: 8,
    paddingBottom: 36,
  },
  profileHeader: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 26,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 16,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8DEFF",
  },
  name: {
    color: "#111111",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0,
    marginBottom: 4,
  },
  viewProfile: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  hostPromo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 24,
    paddingVertical: 17,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
  },
  hostIconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  hostCopy: {
    flex: 1,
  },
  hostTitle: {
    color: "#4B4B4B",
    fontSize: 14,
    lineHeight: 18,
  },
  hostLink: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
    marginTop: 1,
  },
  section: {
    paddingTop: 5,
  },
  sectionTitle: {
    color: "#111111",
    fontSize: 21,
    fontWeight: "700",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  rows: {
    borderTopWidth: 1,
    borderColor: "#E7E7E7",
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
    backgroundColor: "#FFFFFF",
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
  },
  themeValue: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  logoutRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: "#E7E7E7",
  },
  logoutText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.65,
  },
  pressedRow: {
    backgroundColor: "#F7F7F7",
  },
});
