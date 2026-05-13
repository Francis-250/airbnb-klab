import { useAuthStore } from "@/store/auth.store";
import { Tabs, useRouter } from "expo-router";
import {
  Heart,
  Home,
  Search,
  UserCircle,
  MessageCircle,
} from "lucide-react-native";

export default function GuestLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#ff385c" }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "WishList",
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: "Trip",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserCircle size={size} color={color} />
          ),
        }}
        listeners={
          !isAuthenticated
            ? {
                tabPress: (e) => {
                  e.preventDefault();
                  router.push("/(auth)/login");
                },
              }
            : undefined
        }
      />
      <Tabs.Screen
        name="[id]"
        options={{
          href: null,
          headerShown: false,
          title: "Listing Details",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="personal-info"
        options={{
          href: null,
          headerShown: false,
          title: "Personal Information",
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
