import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface RewardsCardProps {
  tokens: number;
  onPress?: () => void;
}

const RewardsCard: React.FC<RewardsCardProps> = ({ tokens, onPress }) => {
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-4 mb-4"
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View className="flex-row mb-4">
        <View className="w-12 h-12 rounded-full bg-[#FDDB33] justify-center items-center mr-4">
          <Text className="text-2xl">🏆</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-black mb-1">Your Rewards</Text>
          <Text className="text-sm text-gray-600 mb-1">
            <Text className="text-base font-bold text-blue-600">{tokens}</Text> tokens
          </Text>
          <Text className="text-xs text-gray-600">
            Earn tokens by completing streaks and achieving goals
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
        <Text className="text-sm font-medium text-blue-600">View Rewards</Text>
        <Text className="text-base text-blue-600">→</Text>
      </View>
    </TouchableOpacity>
  );
};



export default RewardsCard;
