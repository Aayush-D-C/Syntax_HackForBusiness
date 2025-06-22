import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Slot, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TABS = [
  { name: 'home', label: 'Dashboard', icon: 'home' },
  { name: 'stocks', label: 'Inventory', icon: 'cube' },
  { name: 'scanner', label: '', icon: 'barcode-scan', center: true },
  { name: 'predict', label: 'Credit Score', icon: 'chart-line' },
  { name: 'blockchain', label: 'Blockchain', icon: 'block-helper' },
  { name: 'history', label: 'History', icon: 'clock' },
];

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Slot />

      {/* Bottom Navigation Bar */}
      <View style={styles.tabContainer}>
        {TABS.map((tab, index) => {
          const isFocused = pathname.includes(tab.name);
          const iconColor = isFocused ? '#6200ee' : '#999';

          if (tab.center) {
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.centerButton}
                onPress={() => router.replace(`/(tabs)/${tab.name}` as any)}
              >
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={36}
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
                name={tab.icon as any}
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
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#fff',
    elevation: 12,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 10,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  centerButton: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 35,
    elevation: 6,
    zIndex: 10,
  },
});
