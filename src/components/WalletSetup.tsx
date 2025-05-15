import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface WalletSetupProps {
  onComplete: (walletAddress: string) => void;
}

const WalletSetup: React.FC<WalletSetupProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'intro' | 'creating' | 'success'>('intro');
  const [walletAddress, setWalletAddress] = useState('');

  const handleCreateWallet = () => {
    setIsLoading(true);
    setStep('creating');
    
    // Simulate wallet creation on Nerochain testnet
    setTimeout(() => {
      // Generate a mock wallet address
      const mockAddress = '0x' + Math.random().toString(16).substring(2, 42);
      setWalletAddress(mockAddress);
      setIsLoading(false);
      setStep('success');
    }, 2000);
  };

  const handleComplete = () => {
    onComplete(walletAddress);
  };

  const renderIntro = () => (
    <View className="bg-white rounded-2xl p-6 items-center w-full">
      <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-6">
        <Text className="text-4xl">🔐</Text>
      </View>
      <Text className="text-lg font-bold text-black mb-4 text-center">Set Up Your Wallet</Text>
      <Text className="text-base text-gray-600 text-center mb-6 leading-6">
        Thryv uses Nerochain testnet to store your funds and rewards securely.
        We'll create a wallet for you in seconds.
      </Text>
      <TouchableOpacity 
        className="bg-blue-600 py-3 px-6 rounded-xl w-full items-center"
        onPress={handleCreateWallet}
      >
        <Text className="text-white text-base font-semibold">Create Wallet</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreating = () => (
    <View className="bg-white rounded-2xl p-6 items-center w-full">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="text-lg font-semibold text-black mt-6 mb-2">Creating your wallet...</Text>
      <Text className="text-sm text-gray-600">This will only take a moment</Text>
    </View>
  );

  const renderSuccess = () => (
    <View className="bg-white rounded-2xl p-6 items-center w-full">
      <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-6">
        <Text className="text-4xl">✅</Text>
      </View>
      <Text className="text-lg font-bold text-black mb-4 text-center">Wallet Created!</Text>
      <Text className="text-base text-gray-600 text-center mb-6 leading-6">
        Your Nerochain testnet wallet has been created successfully.
      </Text>
      <View className="bg-gray-100 p-4 rounded-lg w-full mb-4">
        <Text className="text-sm text-gray-600 mb-1">Your Wallet Address:</Text>
        <Text className="text-sm text-black font-medium">{walletAddress}</Text>
      </View>
      <Text className="text-xs text-gray-600 italic mb-6">
        This is a testnet wallet for demonstration purposes.
      </Text>
      <TouchableOpacity 
        className="bg-blue-600 py-3 px-6 rounded-xl w-full items-center"
        onPress={handleComplete}
      >
        <Text className="text-white text-base font-semibold">Continue</Text>
      </TouchableOpacity>
    </View>
  );

  if (step === 'creating') return renderCreating();
  if (step === 'success') return renderSuccess();
  return renderIntro();
};



export default WalletSetup;
