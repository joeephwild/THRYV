import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Boxing-Regular': require('../assets/fonts/Boxing-Regular.otf'),
          'CabinetGrotesk-Regular': require('../assets/fonts/CabinetGrotesk-Regular.otf'),
          'CabinetGrotesk-Thin': require('../assets/fonts/CabinetGrotesk-Thin.otf'),
          'CabinetGrotesk-Light': require('../assets/fonts/CabinetGrotesk-Light.otf'),
          'CabinetGrotesk-Medium': require('../assets/fonts/CabinetGrotesk-Medium.otf'),
          'CabinetGrotesk-Bold': require('../assets/fonts/CabinetGrotesk-Bold.otf'),
          'CabinetGrotesk-Black': require('../assets/fonts/CabinetGrotesk-Black.otf'),
          'CabinetGrotesk-Extrabold': require('../assets/fonts/CabinetGrotesk-Extrabold.otf'),
          'CabinetGrotesk-Extralight': require('../assets/fonts/CabinetGrotesk-Extralight.otf'),
        });
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
};

export const hideSplashScreen = async () => {
  await SplashScreen.hideAsync();
};
