// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { BlockchainProvider } from "../context/BlockchainContext";
import { DataProvider } from '../context/DataContext';
import { ScanProvider } from "../context/ScanContext";

// Suppress maximum update depth warnings if they still occur
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  if (message.includes('Maximum update depth exceeded')) {
    // Suppress this specific warning
    return;
  }
  originalConsoleWarn.apply(console, args);
};

function RootLayout() {
  const { isLoggedIn, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inWelcomeScreen = segments[0] === "welcome";
    const inTabsHome = segments[0] === "(tabs)" && segments[1] === "home";

    if (!isLoggedIn) {
      if (!inAuthGroup && !inWelcomeScreen) {
        router.replace("/welcome");
      }
    } else if (isLoggedIn && (inAuthGroup || inWelcomeScreen)) {
      if (!inTabsHome) {
        router.replace("/(tabs)/home");
      }
    }
  }, [isLoggedIn, isInitialized, segments]);

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-shopkeeper" options={{ headerShown: false }} />
      <Stack.Screen name="product-action" options={{ headerShown: false }} />
      <Stack.Screen name="add-item-scanner" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <DataProvider>
            <BlockchainProvider>
              <ScanProvider>
                <RootLayout />
              </ScanProvider>
            </BlockchainProvider>
          </DataProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}