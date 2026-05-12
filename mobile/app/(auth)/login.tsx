import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (type === "login") {
      await login(email, password);
      return;
    }

    if (password !== confirmPassword) {
      console.warn("Passwords do not match");
      return;
    }

    const name = email.split("@")[0] || "User";
    await signup(name, email, password);
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
              {isLogin ? "Login to your Account" : "Create your Account"}
            </Text>
          </View>
          <View style={styles.form}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#777f8c"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#777f8c"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            {!isLogin && (
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#777f8c"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
              />
            )}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={() => handleSubmit(isLogin ? "login" : "signup")}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Please wait..." : isLogin ? "Sign in" : "Sign up"}
              </Text>
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
            <Pressable onPress={() => setIsLogin(!isLogin)}>
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
    gap: 54,
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
    fontSize: 18,
    fontWeight: "700",
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
