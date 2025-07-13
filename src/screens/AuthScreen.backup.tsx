import React, { useState, useEffect } from 'react';
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
import { loginSuccess, setWalletInfo } from '../store/slices/authSlice'; // Updated to use authSlice actions
// import { firebaseAuth } from '../config/firebaseConfig';
import { Feather } from '@expo/vector-icons';
import rallyWalletService from '../wallet/RallyWalletService';
import walletService from '../wallet/WalletService'; // Added Nero wallet service

type AuthMode = 'signup' | 'signin';

const AuthScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = () => {
    if (mode === 'signup') {
      if (!confirmPassword) {
        setConfirmPasswordError('Please confirm your password');
        return false;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        return false;
      }
      setConfirmPasswordError('');
    }
    return true;
  };

  const validateForm = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    return isEmailValid && isPasswordValid && (mode === 'signin' || isConfirmPasswordValid);
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Create user with email and password
    //   const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    //   const user = userCredential.user;

    //   // Update user profile with name
    //   await user.updateProfile({
    //     displayName: name
    //   });

      // Initialize Rally Protocol wallet
      let rallyEoaAddressSignUp: string | null = null;
      let rallyAaAddressSignUp: string | null = null;
      try {
        console.log('Initializing Rally Wallet for new user...');
        const rallyData = await rallyWalletService.initializeWallet();
        rallyEoaAddressSignUp = rallyData.wallet.address; // Rally EOA
        rallyAaAddressSignUp = rallyData.accountAddress; // Rally AA
        console.log('Rally Wallet Initialized (SignUp): EOA:', rallyEoaAddressSignUp, 'AA:', rallyAaAddressSignUp);
      } catch (rallyError: any) {
        console.error('Rally Wallet Initialization Error (SignUp):', rallyError);
        Alert.alert('Rally Wallet Error', rallyError.message || 'Could not initialize Rally wallet.');
      }

      // Initialize EOA Wallet
      let eoaAddressSignUp: string | null = null;
      try {
        console.log('Creating and Initializing Wallet for new user...');
        await walletService.createNewWallet(); // Ensures a new EOA is created and stored
        const { wallet: eoaWallet } = await walletService.initializeWallet();
        eoaAddressSignUp = eoaWallet.address;
        console.log('EOA Address (SignUp):', eoaAddressSignUp);
      } catch (walletError: any) {
        console.error('Wallet Initialization Error (SignUp):', walletError);
        Alert.alert('Wallet Error', walletError.message || 'Could not initialize wallet.');
      }

      // Update Redux state with Firebase user object
      dispatch(loginSuccess(user)); // user is userCredential.user from Firebase

      // Update Redux state with wallet addresses
      dispatch(setWalletInfo({
        eoaAddress: eoaAddressSignUp,   // EOA wallet address
        rallyAddress: rallyAaAddressSignUp  // Rally's AA address
      }));

      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error during sign up:', error);
      Alert.alert(
        'Sign Up Failed',
        error.message || 'There was an error creating your account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateEmail() || !validatePassword()) return;

    setIsLoading(true);
    try {
    //   // Sign in user with email and password
    //   const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    //   const user = userCredential.user;

      // Get Rally wallet for existing user
      let rallyEoaAddressSignIn: string | null = null;
      let rallyAaAddressSignIn: string | null = null;
      try {
        // console.log('Initializing Rally Wallet for existing user...');
        // const rallyData = await rallyWalletService.getWallet(user.uid);
        // rallyEoaAddressSignIn = rallyData.wallet.address; // Rally EOA
        // rallyAaAddressSignIn = rallyData.accountAddress; // Rally AA
        console.log('Rally Wallet Initialized (SignIn): EOA:', rallyEoaAddressSignIn, 'AA:', rallyAaAddressSignIn);
      } catch (rallyError: any) {
        console.error('Rally Wallet Initialization Error (SignIn):', rallyError);
        Alert.alert('Rally Wallet Error', rallyError.message || 'Could not retrieve Rally wallet.');
      }

      // Initialize EOA Wallet for existing user
      let eoaAddressSignIn: string | null = null;
      try {
        console.log('Initializing Wallet for existing user...');
        const { wallet: eoaWallet } = await walletService.initializeWallet();
        eoaAddressSignIn = eoaWallet.address;
        console.log('EOA Address (SignIn):', eoaAddressSignIn);
      } catch (walletError: any) {
        console.error('Wallet Initialization Error (SignIn):', walletError);
        Alert.alert('Wallet Error', walletError.message || 'Could not initialize wallet.');
      }

      // Update Redux state with Firebase user object
      dispatch(loginSuccess(user)); // user is userCredential.user from Firebase

      // Update Redux state with wallet addresses
      dispatch(setWalletInfo({
        eoaAddress: eoaAddressSignIn,   // EOA wallet address
        rallyAddress: rallyAaAddressSignIn  // Rally's AA address
      }));

      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error during sign in:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'signup') {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'signin' : 'signup');
    // Clear errors when switching modes
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setEmailError('Please enter your email to reset password');
      return;
    }

    try {
    //   await firebaseAuth.sendPasswordResetEmail(email);
    //   Alert.alert(
    //     'Password Reset Email Sent',
    //     'Check your email for instructions to reset your password.'
    //   );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send password reset email. Please try again.'
      );
    }
  };

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
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </Text>
          </View>

          {/* Form section */}
          <View className="px-6 mb-6">
            {/* Email input */}
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
                className="bg-white p-4 rounded-xl font-cabinet-regular text-[#0A0B0F]"
              />
              {emailError ? (
                <Text className="text-red-500 mt-1 font-cabinet-regular">{emailError}</Text>
              ) : null}
            </View>

            {/* Password input */}
            <View className="mb-4">
              <Text className="text-[#0A0B0F] font-cabinet-medium mb-2">Password</Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onBlur={validatePassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  className="bg-white p-4 rounded-xl font-cabinet-regular text-[#0A0B0F] pr-12"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#0A0B0F" />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text className="text-red-500 mt-1 font-cabinet-regular">{passwordError}</Text>
              ) : null}
            </View>

            {/* Confirm Password input (Sign Up only) */}
            {mode === 'signup' && (
              <View className="mb-4">
                <Text className="text-[#0A0B0F] font-cabinet-medium mb-2">Confirm Password</Text>
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onBlur={validateConfirmPassword}
                    placeholder="Confirm your password"
                    secureTextEntry={!showConfirmPassword}
                    className="bg-white p-4 rounded-xl font-cabinet-regular text-[#0A0B0F] pr-12"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4"
                  >
                    <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#0A0B0F" />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text className="text-red-500 mt-1 font-cabinet-regular">{confirmPasswordError}</Text>
                ) : null}
              </View>
            )}

            {/* Additional fields for Sign Up */}
            {mode === 'signup' && (
              <>
                <View className="mb-4">
                  <Text className="text-[#0A0B0F] font-cabinet-medium mb-2">Full Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    className="bg-white p-4 rounded-xl font-cabinet-regular text-[#0A0B0F]"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-[#0A0B0F] font-cabinet-medium mb-2">Phone Number (Optional)</Text>
                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    className="bg-white p-4 rounded-xl font-cabinet-regular text-[#0A0B0F]"
                  />
                </View>
              </>
            )}

            {/* Forgot Password (Sign In only) */}
            {mode === 'signin' && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                className="mb-4"
              >
                <Text className="text-[#0A0B0F] font-cabinet-medium text-right">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`bg-[#0A0B0F] p-4 rounded-xl items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-cabinet-bold text-lg">
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle between Sign In and Sign Up */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-[#0A0B0F] font-cabinet-regular">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleMode} className="ml-1">
                <Text className="text-[#0A0B0F] font-cabinet-bold">
                  {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom section with info */}
        <View className="pb-6 px-6" style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}>
          <Text className="text-center text-sm font-cabinet-regular text-gray-600">
            No wallet or crypto knowledge required.
            We'll handle everything for you!
          </Text>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
