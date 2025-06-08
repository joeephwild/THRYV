import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Feather, Ionicons } from '@expo/vector-icons';

interface BalanceCardProps {
  balance: number;
  currency: string;
  currencyName: string;
  onPress?: () => void;
  chartData?: number[];
  rewardsCount?: number;
  inflowPercentage?: number;
  onViewPortfolio?: () => void;
  activeIndex?: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  currency,
  currencyName,
  onPress,
  chartData = [50, 60, 70, 80, 90, 100, 110, 120, 130, 150, 180, 200, 220],
  rewardsCount = 0,
  inflowPercentage = 0,
  onViewPortfolio,
  activeIndex = 0,
}) => {
  const giftedChartData = chartData.map(value => ({ value }));

  return (
    <TouchableOpacity
      className="p-6 rounded-3xl mb-4 w-full bg-[#FDDB33] border-b-8 border-l-4 border-r-2 border-t-2 border-[#0A0B0F] shadow-black"
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View className="flex-row justify-between items-start">
        <View>
          <View className="flex-row items-center">
            <Text className="text-lg font-medium font-cabinet-medium text-[#0A0B0F] mb-1">{currencyName} Balance</Text>
            <Feather name="eye" size={20} color="#0A0B0F" className="ml-2" />
          </View>
          <View className="flex-row items-baseline">
            <Text className="text-[#0A0B0F] font-cabinet-bold text-lg mr-1">{currency}</Text>
            <Text className="text-5xl font-bold text-[#0A0B0F] font-cabinet-bold">
              {parseInt(balance.toString())}<Text className="text-3xl">.{balance.toString().split('.')[1] || '00'}</Text>
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="flash" size={24} color="#0A0B0F" />
          <Text className="text-2xl font-bold text-[#0A0B0F] ml-1">{rewardsCount}</Text>
        </View>
      </View>

      {/* Chart area */}
      {/* <View className="h-40 mt-4">
        <LineChart
          data={giftedChartData}
          color="#4ADE80" // Based on your previous Decorator stroke
          thickness={2}
          curved={false} // d3-shape.curveLinear results in straight lines
          hideDataPoints // To keep the line clean, similar to original
          spacing={20} // General spacing, replaces spacingTop/Bottom
          // Hide axes and grid lines for a cleaner look
          hideYAxisText
          hideRules
          yAxisColor="transparent"
          xAxisColor="transparent"
          yAxisThickness={0}
          xAxisThickness={0}
          initialSpacing={10} // Adjust as needed for start padding
          endSpacing={10} // Adjust as needed for end padding
        />
      </View> */}

      {/* Bottom section */}
      <View className="flex-row justify-between items-center mt-3">
        <Text className="text-[#0A0B0F]/80 text-base font-cabinet-medium">{inflowPercentage}% inflow today</Text>
        <TouchableOpacity
          onPress={onViewPortfolio}
          className="flex-row items-center"
        >
          <Text className="text-[#0A0B0F] text-base mr-1 font-cabinet-medium">View portfolio</Text>
          <Feather name="chevron-right" size={18} color="#0A0B0F" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default BalanceCard;
