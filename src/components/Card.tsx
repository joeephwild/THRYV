import React from 'react';
import { View, Text, ViewStyle, TouchableOpacity } from 'react-native';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  style,
  color = '#FDDB33',
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      className="rounded-2xl p-4 mb-4 shadow-md border-b-8 border-l-4 border-r-2 border-t-2 border-[#0A0B0F]"
      style={[{ backgroundColor: color }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
    >
      {title && <Text className="text-base font-bold mb-2 text-black">{title}</Text>}
      {children}
    </CardComponent>
  );
};



export default Card;
