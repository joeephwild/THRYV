import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { SocialLoginType } from '../wallet/SocialLoginService';

interface SocialLoginButtonsProps {
  onLogin: (type: SocialLoginType) => Promise<void>;
  isLoading: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onLogin, isLoading }) => {
  return (
    <View className="w-full gap-y-4">
      <Text className="text-center text-lg font-cabinet-medium mb-2 text-gray-700">
        Continue with
      </Text>
      
      {/* Google Login Button */}
      <TouchableOpacity 
        className="flex-row items-center justify-center bg-white py-3 px-4 rounded-xl border border-gray-300"
        onPress={() => onLogin(SocialLoginType.GOOGLE)}
        disabled={isLoading}
      >
        <Image 
          source={require('../assets/images/google-icon.png')} 
          contentFit="contain"
          className="w-6 h-6 mr-3"
        />
        <Text className="text-base font-cabinet-medium text-gray-800">
          Continue with Google
        </Text>
      </TouchableOpacity>
      
      {/* Apple Login Button */}
      <TouchableOpacity 
        className="flex-row items-center justify-center bg-black py-3 px-4 rounded-xl"
        onPress={() => onLogin(SocialLoginType.APPLE)}
        disabled={isLoading}
      >
        <Image 
          source={require('../assets/images/apple-icon.png')} 
          contentFit="contain"
          className="w-6 h-6 mr-3"
        />
        <Text className="text-base font-cabinet-medium text-white">
          Continue with Apple
        </Text>
      </TouchableOpacity>
      
      {/* Email Login Button */}
      <TouchableOpacity 
        className="flex-row items-center justify-center bg-[#FFDE59] py-3 px-4 rounded-xl border-4 border-[#0A0B0F]"
        onPress={() => onLogin(SocialLoginType.EMAIL)}
        disabled={isLoading}
      >
        <Text className="text-base font-cabinet-bold text-[#0A0B0F]">
          Continue with Email
        </Text>
      </TouchableOpacity>
      
      {/* Loading Indicator */}
      {isLoading && (
        <View className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
          <ActivityIndicator size="large" color="#FFDE59" />
        </View>
      )}
      
      {/* Terms and Privacy */}
      <Text className="text-center text-xs font-cabinet-regular text-gray-500 mt-4">
        By continuing, you agree to our{' '}
        <Text className="text-blue-500">Terms of Service</Text> and{' '}
        <Text className="text-blue-500">Privacy Policy</Text>
      </Text>
    </View>
  );
};

export default SocialLoginButtons;
