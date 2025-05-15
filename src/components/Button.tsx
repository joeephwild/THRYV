import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator 
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon
}) => {
  const getButtonClasses = () => {
    let baseClasses = 'rounded-xl flex-row justify-center items-center gap-2';
    
    // Variant classes
    if (variant === 'primary') {
      baseClasses += ' bg-blue-600';
    } else if (variant === 'secondary') {
      baseClasses += ' bg-purple-500';
    } else if (variant === 'outline') {
      baseClasses += ' bg-transparent border border-blue-600';
    }
    
    // Size classes
    if (size === 'small') {
      baseClasses += ' py-2 px-4';
    } else if (size === 'medium') {
      baseClasses += ' py-3 px-6';
    } else if (size === 'large') {
      baseClasses += ' py-4 px-8';
    }
    
    // Disabled state
    if (disabled) {
      baseClasses += ' opacity-50';
    }
    
    return baseClasses;
  };
  
  const getTextClasses = () => {
    let textClasses = 'text-base font-semibold';
    
    if (variant === 'outline') {
      textClasses += ' text-blue-600';
    } else {
      textClasses += ' text-white';
    }
    
    return textClasses;
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      style={style}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563eb' : '#ffffff'} />
      ) : (
        <>
          {icon}
          <Text className={getTextClasses()} style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};



export default Button;
