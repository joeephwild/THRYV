import React from 'react';
import { View, Text } from 'react-native';

interface StreakIndicatorProps {
  days: number;
  maxDays?: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  days,
  maxDays = 7,
  showLabel = true,
  size = 'medium',
}) => {
  // Create an array of length maxDays
  const daysArray = Array.from({ length: maxDays }, (_, i) => i < days);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'gap-1',
          dot: 'w-2 h-2',
          label: 'text-xs'
        };
      case 'large':
        return {
          container: 'gap-2',
          dot: 'w-4 h-4',
          label: 'text-base'
        };
      default:
        return {
          container: 'gap-1.5',
          dot: 'w-3 h-3',
          label: 'text-sm'
        };
    }
  };
  
  const sizeClasses = getSizeClasses();

  return (
    <View className="items-center">
      <View className={`flex-row mb-1 ${sizeClasses.container}`}>
        {daysArray.map((isActive, index) => (
          <View
            key={index}
            className={`rounded-md ${sizeClasses.dot} ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}
          />
        ))}
      </View>
      
      {showLabel && (
        <Text className={`text-gray-600 font-medium ${sizeClasses.label}`}>
          {days}-day streak 🔥
        </Text>
      )}
    </View>
  );
};



export default StreakIndicator;
