import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';
import SocialLoginButtons from '../components/SocialLoginButtons';
import socialLoginService, { SocialLoginType } from '../wallet/SocialLoginService';
import walletService from '../wallet/WalletService';

const SocialLoginScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSocialLogin = async (type: SocialLoginType) => {
    setIsLoading(true);
    try {
      // Perform social login
      const userInfo = await socialLoginService.login(type);
      
      // Initialize wallet
      const { wallet, accountAddress } = await walletService.initializeWallet();
      
      // Update Redux state with user info
      dispatch(setUser({
        id: userInfo.id,
        name: userInfo.name || 'Thryv User',
        email: userInfo.email || '',
        profileImage: userInfo.profileImage || '',
        walletAddress: wallet.address,
        accountAddress: accountAddress || '',
      }));
      
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error during social login:', error);
      Alert.alert(
        'Login Failed',
        'There was an error logging in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FFFBEB]"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        {/* Top section with logo and welcome text */}
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center mb-10">
            <Text className="text-[50px] font-cabinet-black text-[#0A0B0F]">Thryv.</Text>
            <Text className="text-[20px] font-cabinet-medium text-[#0A0B0F] text-center mt-2">
              Join the financial revolution
            </Text>
          </View>
          
          <View className="w-full max-w-sm">
            <SocialLoginButtons 
              onLogin={handleSocialLogin}
              isLoading={isLoading}
            />
          </View>
        </View>
        
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

export default SocialLoginScreen;
