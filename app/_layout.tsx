// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { DataProvider } from '../context/DataContext';
import { ScanProvider } from "../context/ScanContext";

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
  }, [isLoggedIn, segments, isInitialized, router]);

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-shopkeeper" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <DataProvider>
            <ScanProvider>
              <RootLayout />
            </ScanProvider>
          </DataProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}