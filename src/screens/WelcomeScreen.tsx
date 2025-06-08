import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { persistor } from '@/store';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useSelector((state: any) => state.user);

  useEffect(() => {
    // Check if user is already logged in
    if (user && user.isLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  const handleGetStarted = () => {
    // Navigate to auth screen (replaced social login)
    router.replace('/auth');
  };

  const handleSignUp = () => {
    persistor.purge();
    router.replace('/onboarding');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FFFBEB]"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Top section with image */}
      <View className="h-[70%] w-full">
        <ImageBackground
          source={require('../assets/images/welcome.jpg')}
          className="w-full h-full"
          resizeMode="cover"
        >
          <View
            className="flex-1 justify-end pb-5"
          >
            <Image
              source={require('../assets/images/welcome.jpg')}
              className="w-0 h-0" // Hidden but kept for reference
              resizeMode="contain"
            />

          </View>
        </ImageBackground>
      </View>

      {/* Bottom section with login form */}
      <View className="h-[30%] bg-[#F4f4f4] px-6 py-6">
        <View className="pl-[12px] mb-6">
          <Text className="text-[40px] font-cabinet-black text-[#0A0B0F]">Thryv.</Text>
          <Text className="text-[20px] font-cabinet-black text-[#0A0B0F]">Stack it. Save it. Thryv.</Text>
        </View>

        <TouchableOpacity
          className="bg-[#FFDE59] border-4 border-[#0A0B0F] py-4 rounded-lg items-center mb-4"
          onPress={handleGetStarted}
        >
          <Text className="text-[#0A0B0F] text-base font-cabinet-bold">GET STARTED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-2 rounded-lg items-center"
          onPress={handleSignUp}
        >
          <Text className="text-[#0A0B0F] text-sm font-cabinet-medium">
            Learn more about Thryv
          </Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
};

export default WelcomeScreen;
