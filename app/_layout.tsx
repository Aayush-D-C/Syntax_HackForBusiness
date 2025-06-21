// app/_layout.tsx
import { useEffect } from "react";
import { Slot, Stack, useRouter, useSegments, usePathname } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScanProvider } from "../context/ScanContext";

const TABS = [
  { name: "home", label: "Home", icon: "home" },
  { name: "history", label: "History", icon: "history" },
  { name: "scanner", label: "", icon: "barcode-scan", center: true },
  { name: "stocks", label: "Stocks", icon: "chart-line" },
  { name: "predict", label: "Predict", icon: "lightbulb-on-outline" },
];

function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <View style={styles.tabContainer}>
        {TABS.map((tab) => {
          const isFocused = pathname.includes(tab.name);
          const iconColor = isFocused ? "#6200ee" : "#999";

          if (tab.center) {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.centerButton}
                onPress={() => router.replace(`/(tabs)/${tab.name}`)}
              >
                <MaterialCommunityIcons name={tab.icon} size={32} color="white" />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => router.replace(`/(tabs)/${tab.name}`)}
            >
              <MaterialCommunityIcons name={tab.icon} size={24} color={iconColor} />
              <Text style={[styles.label, { color: iconColor }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function RootLayout() {
  const { isLoggedIn, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inWelcomeScreen = segments[0] === "welcome";

    if (!isLoggedIn) {
      if (!inAuthGroup && !inWelcomeScreen) {
        router.replace("/welcome");
      }
    } else if (isLoggedIn && (inAuthGroup || inWelcomeScreen)) {
      router.replace("/(tabs)/home");
    }
  }, [isLoggedIn, segments, isInitialized]);

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <ScanProvider>
            <RootLayout>
              <TabLayout />
            </RootLayout>
          </ScanProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    height: 70,
    backgroundColor: "#fff",
    elevation: 12,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  centerButton: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 40,
    elevation: 6,
    zIndex: 10,
  },
});