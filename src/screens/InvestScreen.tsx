import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';

interface StockItem {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  logo: string;
  esgRating: number;
  description: string;
  highlights: string[];
}

const InvestScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Mock data for stocks
  const stocks: StockItem[] = [
    {
      id: '1',
      name: 'Nvidia',
      ticker: 'NVDA',
      price: 387.83,
      change: 29.68,
      changePercent: 3.68,
      logo: '🟢',
      esgRating: 4.5,
      description: 'Nvidia makes graphics processing units (GPUs) used in gaming consoles, supercomputers, mobile devices, and self-driving cars.',
      highlights: [
        'Nvidia is the major GPU supplier in the gaming industry',
        'Strong growth in data centers and gaming with its flagship RTX products',
        'Driving social change with its products, key innovations in AI and autonomous cars'
      ]
    },
    {
      id: '2',
      name: 'Microsoft',
      ticker: 'MSFT',
      price: 328.79,
      change: 7.22,
      changePercent: 2.25,
      logo: '🔵',
      esgRating: 4.0,
      description: 'Microsoft aims to enable as a productivity and platform company for the mobile-first, cloud-first world.',
      highlights: [
        'Various ESG initiatives include creating people-friendly workplaces',
        'Strengthening diversity and inclusion',
        'Driving social change with its products'
      ]
    },
    {
      id: '3',
      name: 'Tesla',
      ticker: 'TSLA',
      price: 175.21,
      change: -2.34,
      changePercent: -1.32,
      logo: '⚡',
      esgRating: 4.2,
      description: 'Tesla designs, develops, manufactures, and sells electric vehicles and energy generation products.',
      highlights: [
        'Leading the transition to sustainable transportation',
        'Reducing carbon footprint through electric vehicles',
        'Innovative battery technology for renewable energy storage'
      ]
    },
  ];

  const categories = ['All', 'ESG', 'AI & ML', 'Quantum Computing', 'Robotics', 'Clean Energy'];

  const renderCategoryPill = (category: string) => {
    const isActive = category === activeCategory;
    
    return (
      <TouchableOpacity 
        key={category}
        className={`px-4 py-2 rounded-full bg-white border mr-2 ${isActive ? 'bg-[#FF8A3D] border-[#FF8A3D]' : 'border-gray-200'}`}
        onPress={() => setActiveCategory(category)}
      >
        <Text 
          className={`text-[14px] font-cabinet-medium ${isActive ? 'text-[#0A0B0F]' : 'text-[#0A0B0F]'}`}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderStockCard = (stock: StockItem) => {
    const isPositive = stock.change >= 0;
    
    return (
      <TouchableOpacity 
        key={stock.id}
        className="bg-white rounded-2xl border-b-8 border-l-4 border-r-2 border-t-2 border-[#0A0B0F] p-4 mb-4"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-lg bg-gray-100 justify-center items-center mr-3">
            <Text className="text-xl">{stock.logo}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[24px] font-semibold text-[#0A0B0F] mb-1 font-cabinet-bold">{stock.name}</Text>
            <View className="flex-row items-center">
              <Text className="text-[16px] text-[#FDDB33] mr-1">{'★'.repeat(Math.floor(stock.esgRating))}</Text>
              <Text className="text-[14px] font-cabinet-medium text-gray-600">Good</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-[20px] font-semibold text-[#0A0B0F] mb-1 font-cabinet-bold">${stock.price}</Text>
            <Text 
              className={`text-[14px] font-cabinet-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}
            >
              {isPositive ? '+' : ''}{stock.change} ({isPositive ? '+' : ''}{stock.changePercent}%)
            </Text>
          </View>
        </View>
        
        <View className="mb-4">
          <Text className="text-[16px] font-semibold text-[#0A0B0F] mb-2 font-cabinet-bold">About</Text>
          <Text className="text-[14px] font-cabinet-medium text-gray-600 leading-5">{stock.description}</Text>
        </View>
        
        <View className="mb-4">
          <Text className="text-[16px] font-semibold text-[#0A0B0F] mb-2 font-cabinet-bold">ESG Highlights</Text>
          {stock.highlights.map((highlight, index) => (
            <Text key={index} className="text-[14px] font-cabinet-medium text-gray-600 mb-1 leading-5">• {highlight}</Text>
          ))}
        </View>
        
        <TouchableOpacity className="bg-[#FF8A3D] rounded-xl py-3 items-center">
          <Text className="text-white text-[16px] font-semibold font-cabinet-bold">Invest Now</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };  

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-2">
          <Text className="text-[32px] font-cabinet-bold text-[#0A0B0F]">Invest</Text>
        </View>
        
        <View className="px-4 mb-4 border-2 border-b-4 border-[#0A0B0F] mx-[16px]">
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-base"
            placeholder="Search companies..."
            placeholderTextColor="#666"
          />
        </View>
        
        <View className="bg-[#FDDB33] mx-4 border-b-8 border-l-8 border-t-2 border-r-2 border-[#0A0B0F] rounded-2xl p-4 flex-row items-center">
          <Text className="flex-1 text-[16px] text-[#0A0B0F] font-cabinet-medium">
            Invest in sustainable and socially responsible companies
          </Text>
          <Text className="text-3xl ml-2">💸</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 py-4"
        >
          {categories.map(renderCategoryPill)}
        </ScrollView>
        
        <View className="px-4 pb-6">
          {stocks.map(renderStockCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



export default InvestScreen;
