import React from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

const TABS: {
  name: string;
  label: string;
  icon: string;
  center?: boolean;
}[] = [
  { name: "home", label: "Home", icon: "home" },
  { name: "history", label: "History", icon: "history" },
  { name: "scanner", label: "", icon: "barcode-scan", center: true },
  { name: "stocks", label: "Stocks", icon: "chart-line" },
  { name: "predict", label: "Predict", icon: "lightbulb-on-outline" },
];


export default function Layout() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <View style={{ flex: 1 }}>
          <Slot />

          {/* Custom Bottom Navigation */}
          <View style={styles.tabContainer}>
            {TABS.map((tab, index) => {
              const isFocused = pathname.includes(tab.name);
              const iconColor = isFocused ? "#6200ee" : "#999";

              if (tab.center) {
                return (
                  <TouchableOpacity
                    key={tab.name}
                    style={styles.centerButton}
                    onPress={() => router.replace(`/(tabs)/${tab.name}` as any)}
                  >
                    <MaterialCommunityIcons
                      name={tab.icon}
                      size={32}
                      color="white"
                    />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={tab.name}
                  style={styles.tab}
                  onPress={() => router.replace(`/(tabs)/${tab.name}` as any)}
                >
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={24}
                    color={iconColor}
                  />
                  <Text style={[styles.label, { color: iconColor }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
