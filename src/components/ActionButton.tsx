import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  color?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  style,
  color = '#9847CA',
}) => {
  return (
    <TouchableOpacity 
      className={`border-2 border-[#0A0B0F] rounded-xl p-3 items-center justify-center min-w-[110px] min-h-[80px]`}
      style={[{ backgroundColor: color }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text className="text-[24px] mb-1 text-[#0A0B0F]">{icon}</Text>
      <Text className="text-sm text-[#0A0B0F] font-medium text-center font-cabinet-bold">{label}</Text>
    </TouchableOpacity>
  );
};



export default ActionButton;
