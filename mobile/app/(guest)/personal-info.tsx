import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Check,
  ChevronLeft,
  X,
  Mail,
  Pen,
  Phone,
  Shield,
  UserCircle,
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { COLORS } from "@/constants/colors";
import { isAxiosError } from "axios";
import { useThemeColors } from "@/hooks/useThemeColors";

type ProfileForm = {
  name: string;
  username: string;
  phone: string;
  bio: string;
};

export default function PersonalInfo() {
  const router = useRouter();
  const { colors, isDark } = useThemeColors();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    username: "",
    phone: "",
    bio: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name ?? "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
    });
  }, [user]);

  const rows = [
    { label: "Full name", value: form.name, field: "name", icon: UserCircle },
    {
      label: "Username",
      value: form.username,
      field: "username",
      icon: UserCircle,
    },
    { label: "Email", value: user?.email, icon: Mail },
    { label: "Phone number", value: form.phone, field: "phone", icon: Phone },
    { label: "Role", value: user?.role, icon: Shield },
    { label: "Host status", value: user?.hostStatus, icon: Shield },
    {
      label: "Bio",
      value: form.bio,
      field: "bio",
      icon: UserCircle,
      multiline: true,
    },
  ];

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const cancelEditing = () => {
    setErrorMessage("");
    setIsEditing(false);
    setForm({
      name: user?.name ?? "",
      username: user?.username ?? "",
      phone: user?.phone ?? "",
      bio: user?.bio ?? "",
    });
  };

  const saveProfile = async () => {
    if (!form.name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }

    setErrorMessage("");
    try {
      await updateProfile({
        name: form.name.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
      });
      setIsEditing(false);
      Alert.alert("Profile updated", "Your personal information was saved.");
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setErrorMessage(message || "Could not update your profile.");
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.BACKGROUND }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.BACKGROUND, borderBottomColor: colors.BORDER_LIGHT },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.TEXT_PRIMARY} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.TEXT_PRIMARY }]}>
          Personal information
        </Text>
        {isEditing ? (
          <Pressable onPress={cancelEditing} hitSlop={10} style={styles.backBtn}>
            <X size={22} color={colors.TEXT_PRIMARY} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setIsEditing(true)}
            hitSlop={10}
            style={styles.backBtn}
          >
            <Pen size={20} color={colors.TEXT_PRIMARY} />
          </Pressable>
        )}
      </View>

      {loading && !user ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.PRIMARY} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.profileBlock}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: isDark ? "#2B2440" : "#E8DEFF" },
                ]}
              >
                <UserCircle size={42} color="#5F4B8B" />
              </View>
            )}
            <Text style={[styles.name, { color: colors.TEXT_PRIMARY }]}>
              {user?.name || "Guest"}
            </Text>
            <Text style={[styles.email, { color: colors.TEXT_SECONDARY }]}>
              {user?.email || "No email"}
            </Text>
          </View>

          {!!errorMessage && (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          )}

          <View style={[styles.rows, { borderTopColor: colors.BORDER_LIGHT }]}>
            {rows.map((row) => {
              const Icon = row.icon;
              const value = row.value ? String(row.value) : "Not provided";
              const editableField = row.field as keyof ProfileForm | undefined;
              const canEdit = isEditing && editableField;

              return (
                <View
                  key={row.label}
                  style={[styles.row, { borderBottomColor: colors.BORDER_LIGHT }]}
                >
                  <Icon size={18} color={colors.TEXT_PRIMARY} strokeWidth={1.8} />
                  <View style={styles.rowBody}>
                    <Text style={[styles.rowLabel, { color: colors.TEXT_PRIMARY }]}>
                      {row.label}
                    </Text>
                    {canEdit ? (
                      <TextInput
                        value={form[editableField]}
                        onChangeText={(text) => updateField(editableField, text)}
                        placeholder={`Enter ${row.label.toLowerCase()}`}
                        placeholderTextColor={colors.TEXT_LIGHT}
                        multiline={row.multiline}
                        keyboardType={
                          editableField === "phone" ? "phone-pad" : "default"
                        }
                        autoCapitalize={
                          editableField === "username" ? "none" : "sentences"
                        }
                        style={[
                          styles.input,
                          {
                            color: colors.TEXT_PRIMARY,
                            borderColor: colors.BORDER,
                            backgroundColor: colors.BACKGROUND_LIGHT,
                          },
                          row.multiline && styles.multilineInput,
                        ]}
                        textAlignVertical={row.multiline ? "top" : "center"}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.rowValue,
                          { color: row.value ? colors.TEXT_SECONDARY : colors.TEXT_LIGHT },
                          !row.value && styles.emptyValue,
                          row.multiline && styles.multilineValue,
                        ]}
                      >
                        {value}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {isEditing && (
            <Pressable
              onPress={saveProfile}
              disabled={loading}
              style={[styles.saveBtn, loading && styles.disabledBtn]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save changes</Text>
                </>
              )}
            </Pressable>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingBottom: 36,
  },
  profileBlock: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E7E7",
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginBottom: 14,
  },
  avatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
  },
  email: {
    marginTop: 4,
    fontSize: 14,
  },
  rows: {
    borderTopWidth: 1,
    marginTop: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  rowValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 10,
    paddingBottom: 10,
    lineHeight: 20,
  },
  emptyValue: {
    color: "#9A9A9A",
  },
  multilineValue: {
    lineHeight: 21,
  },
  errorMessage: {
    marginHorizontal: 24,
    marginTop: 18,
    color: COLORS.ERROR,
    fontSize: 13,
    lineHeight: 18,
  },
  saveBtn: {
    marginHorizontal: 24,
    marginTop: 24,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.65,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
