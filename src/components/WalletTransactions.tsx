import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadWallet, addPaymaster } from '../utils/nerochain';
import { ethers } from 'ethers';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'reward';
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

interface WalletTransactionsProps {
  goalId?: string; // Optional goal ID to filter transactions
}

const WalletTransactions: React.FC<WalletTransactionsProps> = ({ goalId }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // Get wallet address from storage
      const address = await AsyncStorage.getItem('walletAddress');
      const privateKey = await AsyncStorage.getItem('walletPrivateKey');
      
      if (address && privateKey) {
        setWalletAddress(address);
        
        // Load wallet using private key
        const walletData = await loadWallet(privateKey);
        
        // Get mock transactions (in a real app, these would come from the blockchain)
        const mockTransactions = getMockTransactions(goalId);
        setTransactions(mockTransactions);
        
        // Set a mock balance (in a real app, this would come from the blockchain)
        setWalletBalance('1000.00');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setLoading(false);
    }
  };

  const getMockTransactions = (goalId?: string): Transaction[] => {
    // In a real app, these would be fetched from the blockchain
    const allTransactions: Transaction[] = [
      {
        id: '1',
        type: 'deposit',
        amount: '100.00',
        timestamp: Date.now() - 86400000 * 2, // 2 days ago
        status: 'completed',
        description: 'Deposit to School Fees goal'
      },
      {
        id: '2',
        type: 'reward',
        amount: '10.00',
        timestamp: Date.now() - 86400000, // 1 day ago
        status: 'completed',
        description: 'Streak reward: 4-week savings streak'
      },
      {
        id: '3',
        type: 'deposit',
        amount: '50.00',
        timestamp: Date.now() - 3600000 * 5, // 5 hours ago
        status: 'completed',
        description: 'Deposit to New Laptop goal'
      },
      {
        id: '4',
        type: 'reward',
        amount: '5.00',
        timestamp: Date.now() - 3600000 * 2, // 2 hours ago
        status: 'completed',
        description: 'Productivity reward: 5 focus sessions completed'
      }
    ];
    
    // Filter by goal ID if provided
    if (goalId) {
      return allTransactions.filter(tx => 
        tx.description.toLowerCase().includes(goalId.toLowerCase())
      );
    }
    
    return allTransactions;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <View className="bg-white p-4 rounded-lg mb-3 border border-gray-200">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <View 
              className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                item.type === 'deposit' ? 'bg-green-100' : 
                item.type === 'withdrawal' ? 'bg-red-100' : 'bg-yellow-100'
              }`}
            >
              <Text className="text-lg">
                {item.type === 'deposit' ? '↓' : 
                 item.type === 'withdrawal' ? '↑' : '🎁'}
              </Text>
            </View>
            <View>
              <Text className="text-base font-semibold">
                {item.type === 'deposit' ? 'Deposit' : 
                 item.type === 'withdrawal' ? 'Withdrawal' : 'Reward'}
              </Text>
              <Text className="text-xs text-gray-500">{formattedDate} at {formattedTime}</Text>
            </View>
          </View>
          <Text 
            className={`text-base font-bold ${
              item.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {item.type === 'withdrawal' ? '-' : '+'}{item.amount} NERO
          </Text>
        </View>
        <Text className="text-sm text-gray-600">{item.description}</Text>
        <View className="mt-2">
          <Text 
            className={`text-xs ${
              item.status === 'completed' ? 'text-green-600' : 
              item.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
            }`}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <ActivityIndicator size="large" color="#FFDE59" />
        <Text className="mt-4 text-gray-600">Loading wallet data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {/* Wallet Balance Card */}
      <View className="bg-[#FFDE59] p-6 rounded-xl mb-6 border-4 border-[#0A0B0F]">
        <Text className="text-[#0A0B0F] text-base mb-2 font-cabinet-medium">Your Balance</Text>
        <Text className="text-[#0A0B0F] text-3xl font-cabinet-bold">{walletBalance} NERO</Text>
        <Text className="text-[#0A0B0F] text-xs mt-2 font-cabinet-medium">Wallet Address: {walletAddress?.substring(0, 8)}...{walletAddress?.substring(walletAddress.length - 6)}</Text>
      </View>
      
      {/* Transactions List */}
      <View className="flex-1">
        <Text className="text-xl font-cabinet-bold mb-4 text-[#0A0B0F]">Recent Transactions</Text>
        {transactions.length > 0 ? (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">No transactions yet</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default WalletTransactions;
