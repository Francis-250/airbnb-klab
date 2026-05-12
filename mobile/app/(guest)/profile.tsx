import { View, Text, Pressable } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

export default function Profile() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  console.log("User in Profile:", user);

  const handleLogout = async () => {
    await logout();
    router.replace("/(guest)");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Text>profile</Text>
        <Pressable onPress={handleLogout}>
          <Text>Logout</Text>
        </Pressable>
        <Text>{user?.name}</Text>
        <Text>{user?.email}</Text>

        <Image
          source={{ uri: user?.avatar }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      </View>
    </SafeAreaView>
  );
}
