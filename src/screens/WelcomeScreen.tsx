import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  Image, 
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../constants/theme';
import WalletSetup from '../components/WalletSetup';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [walletCreated, setWalletCreated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleWalletComplete = (walletAddress: string) => {
    // In a real app, we would store the wallet address in secure storage
    console.log('Wallet created:', walletAddress);
    setWalletCreated(true);
    setModalVisible(false);
  };

  const handleGetStarted = () => {
    if (walletCreated) {
      router.replace('/onboarding');
    } else {
      setModalVisible(true);
    }
  };
  
  const handleLogin = () => {
    // In a real app, we would validate credentials
    console.log('Login with:', username, password);
    router.replace('/(tabs)');
  };
  
  const handleSignUp = () => {
    router.push('/signup');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      <View className="h-[20%] bg-[#F4f4f4] px-6 py-6 gap-y-[60px]">
      <View className="pl-[12px]">
              <Text className="text-[40px] font-cabinet-black text-[#0A0B0F]">Thryv.</Text>
              <Text className="text-[20px] font-cabinet-black text-[#0A0B0F]">Stack it. Save it. Thryv.</Text>
            </View>
        
        <TouchableOpacity 
          className="bg-[#FFDE59] border-4 border-[#0A0B0F] py-4 rounded-lg items-center mb-4"
          onPress={handleLogin}
        >
          <Text className="text-[#0A0B0F] text-base font-cabinet-bold">LOGIN</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default WelcomeScreen;