import React from 'react';
import { View, Text } from 'react-native';

interface TransactionItemProps {
  name: string;
  date: string;
  amount: number;
  type: 'expense' | 'income';
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  name,
  date,
  amount,
  type,
}) => {
  const isExpense = type === 'expense';
  
  return (
    <View className="flex-row items-center py-3 border-b border-gray-200">
      <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
        <Text className="text-[16px] ">
          {isExpense ? '📤' : '📥'}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-[16px] font-cabinet-medium text-[#0A0B0F]">{name}</Text>
        <Text className="text-[14px] font-cabinet-light text-[#6B7280] mt-0.5">Today, {date}</Text>
      </View>
      <Text 
        className={`text-[16px] font-cabinet-bold ${isExpense ? 'text-red-500' : 'text-green-500'}`}
      >
        {isExpense ? '-' : '+'}${Math.abs(amount).toFixed(2)}
      </Text>
    </View>
  );
};



export default TransactionItem;
