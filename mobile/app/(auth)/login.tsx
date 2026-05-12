import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import type { AxiosError } from "axios";

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.register);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(guest)");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (type: "login" | "signup") => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    setErrorMessage("");

    if (!trimmedEmail || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    if (type === "signup" && !trimmedName) {
      setErrorMessage("Name is required.");
      return;
    }

    if (type === "signup" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      if (type === "login") {
        await login(trimmedEmail, password);
        return;
      }

      await signup(trimmedName, trimmedEmail, password);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(
        axiosError.response?.data?.message ||
          (type === "login"
            ? "Could not sign you in. Please try again."
            : "Could not create your account. Please try again."),
      );
    }
  };

  const toggleMode = () => {
    setIsLogin((current) => !current);
    setErrorMessage("");
    setConfirmPassword("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!isLogin && (
            <Pressable
              style={styles.backButton}
              onPress={() => setIsLogin(true)}
            >
              <ArrowLeft color="#0b2f7f" size={24} strokeWidth={2.3} />
            </Pressable>
          )}
          <View style={styles.header}>
            <Text style={styles.logo}>Airbnb</Text>
            <Text style={styles.title}>
              {isLogin ? "Welcome back" : "Create your account"}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? "Sign in to manage trips, saved places, and messages."
                : "Join as a guest and start finding places to stay."}
            </Text>
          </View>
          <View style={styles.form}>
            {!isLogin && (
              <TextInput
                autoCapitalize="words"
                editable={!loading}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor="#777f8c"
                style={styles.input}
                textContentType="name"
                value={name}
              />
            )}
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#777f8c"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
            />
            <View style={styles.passwordField}>
              <TextInput
                editable={!loading}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#777f8c"
                secureTextEntry={!passwordVisible}
                style={[styles.input, styles.passwordInput]}
                textContentType={isLogin ? "password" : "newPassword"}
                value={password}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? "Hide password" : "Show password"
                }
                onPress={() => setPasswordVisible((visible) => !visible)}
                style={styles.passwordToggle}
              >
                {passwordVisible ? (
                  <EyeOff color={COLORS.TEXT_SECONDARY} size={20} />
                ) : (
                  <Eye color={COLORS.TEXT_SECONDARY} size={20} />
                )}
              </Pressable>
            </View>
            {!isLogin && (
              <TextInput
                editable={!loading}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#777f8c"
                secureTextEntry
                style={styles.input}
                textContentType="newPassword"
                value={confirmPassword}
              />
            )}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={() => handleSubmit(isLogin ? "login" : "signup")}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.TEXT_WHITE} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLogin ? "Sign in" : "Create account"}
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.socialSection}>
            <Text style={styles.socialLabel}>
              {isLogin ? "- Or sign in with -" : "- Or sign up with -"}
            </Text>
            <View style={styles.socialRow}>
              <Pressable style={styles.socialButton}>
                <Image
                  source={require("../../assets/icons/google.png")}
                  style={styles.socialIcon}
                  contentFit="contain"
                />
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Image
                  source={require("../../assets/icons/facebook.png")}
                  style={styles.socialIcon}
                  contentFit="contain"
                />
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Image
                  source={require("../../assets/icons/twitter.png")}
                  style={styles.socialIcon}
                  contentFit="contain"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <Pressable onPress={toggleMode}>
              <Text style={styles.switchText}>
                {isLogin ? "Sign up" : "Sign in"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 24,
  },
  backButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  header: {
    marginTop: 42,
    marginBottom: 24,
    gap: 10,
  },
  logo: {
    color: COLORS.PRIMARY,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 36,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  form: {
    gap: 22,
  },
  input: {
    height: 56,
    borderRadius: 3,
    backgroundColor: COLORS.BACKGROUND,
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    paddingHorizontal: 16,
    shadowColor: COLORS.BORDER_LIGHT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 7,
  },
  primaryButton: {
    height: 56,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.PRIMARY,
    marginTop: 8,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.32,
    shadowRadius: 11,
    elevation: 8,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#FFF1F1",
    borderColor: "#FFD5D5",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 13,
    fontWeight: "600",
  },
  passwordField: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 52,
  },
  passwordToggle: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    right: 10,
    top: 0,
    width: 40,
  },
  socialSection: {
    alignItems: "center",
    marginTop: 62,
    gap: 24,
  },
  socialLabel: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 14,
    fontWeight: "500",
  },
  socialRow: {
    flexDirection: "row",
    gap: 8,
  },
  socialButton: {
    width: 88,
    height: 48,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.BACKGROUND,
    shadowColor: COLORS.BORDER_LIGHT,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },
  footerText: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 13,
  },
  switchText: {
    color: COLORS.PRIMARY,
    fontSize: 13,
    fontWeight: "700",
  },
});
