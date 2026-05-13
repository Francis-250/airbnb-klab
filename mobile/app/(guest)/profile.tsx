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
  UserCircle,
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { COLORS } from "@/constants/colors";

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
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.profileHeader}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <UserCircle size={34} color="#5F4B8B" />
            </View>
          )}

          <Text style={styles.name}>{user?.name || "Guest"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.rows}>
            {settings.map((item) => {
              const Icon = item.icon;

              return (
                <Pressable
                  key={item.label}
                  onPress={() => handleSettingPress(item)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressedRow,
                  ]}
                >
                  <Icon size={18} color="#1A1A1A" strokeWidth={1.8} />
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <ChevronRight size={20} color="#111" strokeWidth={2.2} />
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutRow,
            pressed && styles.pressedRow,
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
    color: "#1A1A1A",
    fontSize: 14,
    fontWeight: "400",
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
