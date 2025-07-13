import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { loginSuccess, setWalletInfo } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { Feather } from '@expo/vector-icons';

type AuthMode = 'signin' | 'signup' | 'verification';

const AuthScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');

  // Form fields
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Validation functions
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateVerificationCode = () => {
    if (!verificationCode) {
      setVerificationError('Verification code is required');
      return false;
    }
    setVerificationError('');
    return true;
  };

  // Send verification code
  const handleSendCode = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await authService.preAuthenticateEmail(email);
      setMode('verification');
      Alert.alert('Verification Code Sent', 'Check your email for the verification code.');
    } catch (error: any) {
      console.error('Pre-authentication error:', error);
      Alert.alert('Error', error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify code and sign in
  const handleVerifyCode = async () => {
    if (!validateVerificationCode()) return;

    setIsLoading(true);
    try {
      const response = await authService.loginWithThirdwebEmail(email, verificationCode);
      
      // Update Redux state
      dispatch(loginSuccess(response.user));
      
      // Set wallet info from thirdweb
      const walletAddress = authService.getWalletAddress();
      if (walletAddress) {
        dispatch(setWalletInfo({
          eoaAddress: walletAddress,
          rallyAddress: null
        }));
      }

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert('Error', error.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social login methods
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithGoogle();
      
      dispatch(loginSuccess(response.user));
      
      const walletAddress = authService.getWalletAddress();
      if (walletAddress) {
        dispatch(setWalletInfo({
          eoaAddress: walletAddress,
          rallyAddress: null
        }));
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Error', error.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithApple();
      
      dispatch(loginSuccess(response.user));
      
      const walletAddress = authService.getWalletAddress();
      if (walletAddress) {
        dispatch(setWalletInfo({
          eoaAddress: walletAddress,
          rallyAddress: null
        }));
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Apple login error:', error);
      Alert.alert('Error', error.message || 'Apple login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authService.loginAsGuest();
      
      dispatch(loginSuccess(response.user));
      
      const walletAddress = authService.getWalletAddress();
      if (walletAddress) {
        dispatch(setWalletInfo({
          eoaAddress: walletAddress,
          rallyAddress: null
        }));
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Guest login error:', error);
      Alert.alert('Error', error.message || 'Guest login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailInput = () => (
    <View className="mb-4">
      <Text className="text-[#0A0B0F] font-cabinet-medium mb-2">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        onBlur={validateEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={mode !== 'verification'}
        className={`bg-white p-4 rounded-xl font-cabinet-regular text-[#0A0B0F] ${mode === 'verification' ? 'opacity-50' : ''}`}
      />
      {emailError ? (
        <Text className="text-red-500 mt-1 font-cabinet-regular">{emailError}</Text>
      ) : null}
    </View>
  );

  const renderVerificationInput = () => (
    <View className="mb-4">
      <Text className="text-[#0A0B0F] font-cabinet-medium mb-2">Verification Code</Text>
      <TextInput
        value={verificationCode}
        onChangeText={setVerificationCode}
        onBlur={validateVerificationCode}
        placeholder="Enter verification code"
        keyboardType="number-pad"
        className="bg-white p-4 rounded-xl font-cabinet-regular text-[#0A0B0F]"
      />
      {verificationError ? (
        <Text className="text-red-500 mt-1 font-cabinet-regular">{verificationError}</Text>
      ) : null}
    </View>
  );

  const renderSocialButtons = () => (
    <View className="mb-6">
      <View className="flex-row items-center mb-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="px-4 text-gray-500 font-cabinet-regular">Or continue with</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>
      
      <View className="flex-row justify-between mb-4">
        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={isLoading}
          className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center justify-center mr-2"
        >
          <Text className="font-cabinet-medium text-[#0A0B0F]">Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleAppleLogin}
          disabled={isLoading}
          className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center justify-center ml-2"
        >
          <Text className="font-cabinet-medium text-[#0A0B0F]">Apple</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        onPress={handleGuestLogin}
        disabled={isLoading}
        className="bg-gray-200 p-4 rounded-xl items-center justify-center"
      >
        <Text className="font-cabinet-medium text-[#0A0B0F]">Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FFFBEB]"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top section with logo and welcome text */}
          <View className="items-center mt-10 mb-6 px-6">
            <Text className="text-[50px] font-cabinet-black text-[#0A0B0F]">Thryv.</Text>
            <Text className="text-[20px] font-cabinet-medium text-[#0A0B0F] text-center mt-2">
              {mode === 'verification' ? 'Enter verification code' : 'Welcome back'}
            </Text>
          </View>

          {/* Form section */}
          <View className="px-6 mb-6">
            {renderEmailInput()}
            
            {mode === 'verification' && renderVerificationInput()}

            {/* Action Button */}
            <TouchableOpacity
              onPress={mode === 'verification' ? handleVerifyCode : handleSendCode}
              disabled={isLoading}
              className={`bg-[#0A0B0F] p-4 rounded-xl items-center justify-center mb-6 ${isLoading ? 'opacity-70' : ''}`}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-cabinet-bold text-lg">
                  {mode === 'verification' ? 'Verify & Sign In' : 'Send Code'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Back button for verification mode */}
            {mode === 'verification' && (
              <TouchableOpacity
                onPress={() => setMode('signin')}
                className="mb-6 items-center"
              >
                <Text className="text-[#0A0B0F] font-cabinet-medium">← Back to email</Text>
              </TouchableOpacity>
            )}

            {/* Social login buttons - only show in initial mode */}
            {mode === 'signin' && renderSocialButtons()}
          </View>
        </ScrollView>

        {/* Bottom section with info */}
        <View className="pb-6 px-6" style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}>
          <Text className="text-center text-sm font-cabinet-regular text-gray-600">
            Secure wallet-based authentication powered by thirdweb.
            No need to remember passwords!
          </Text>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
