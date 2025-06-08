import 'react-native-get-random-values';
import "../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "../constants/theme";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { WalletProvider } from '../wallet/WalletContext';
import { useFonts, hideSplashScreen } from '../utils/fonts';
import { View, Text } from 'react-native';

// This layout sets up the root navigation structure
export default function RootLayout() {
  const fontsLoaded = useFonts();

  useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      hideSplashScreen();
    }
  }, [fontsLoaded]);

  // Show a loading screen until fonts are loaded
  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFFBEB]">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <WalletProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="social-login" />
              <Stack.Screen name="goals" />
              <Stack.Screen name="productivity" />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaProvider>
        </WalletProvider>
      </PersistGate>
    </Provider>
  );
}
