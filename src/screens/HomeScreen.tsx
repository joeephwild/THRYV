import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import AccountCard from '../components/AccountCard';
import ActionButton from '../components/ActionButton';
import TransactionItem from '../components/TransactionItem';
import Card from '../components/Card';
import { useRouter } from 'expo-router';

const HomeScreen: React.FC = () => {
    const router = useRouter()
  // Mock data for the UI
  const accounts = [
    { id: '1', balance: 190.20, currency: '$', currencyName: 'US Dollar' },

  ];

  const transactions = [
    { id: '1', name: 'Zara', date: '12:41', amount: 24.99, type: 'expense' as const },
    { id: '2', name: 'Transfer from Ada', date: '12:41', amount: 100, type: 'income' as const },
    { id: '3', name: 'Lidl', date: '12:41', amount: 12.42, type: 'expense' as const },
    { id: '4', name: 'Walmart', date: '12:41', amount: 19.00, type: 'expense' as const },
    { id: '5', name: 'Walmart', date: '12:41', amount: 19.00, type: 'expense' as const },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
          <Text className="text-[32px] font-cabinet-bold text-black">Accounts</Text>
        </View>
  <View className='px-6'>
  <AccountCard
  balance={190.20}
  currency="$"
  currencyName="US Dollar"
  // isActive={true}
  // onPress={() => handleAccountPress('usd')}
/>
  </View>


        <View className="flex-row justify-between px-4 mb-6">
          <ActionButton
            icon="+"
            label="Add money"
            onPress={() => {}}
            color="#E6B8FF"
          />
          <ActionButton
            icon="↔"
            label="Exchange"
            onPress={() => {}}
            color="#D8B8FF"
          />
          <ActionButton
            icon="📊"
            label="Insights"
            onPress={() => {}}
            color="#C8B8FF"
          />
        </View>


        <View className="px-4 mb-6">
          <Card
            title="Focus Time"
            color="#B8FFED"
            onPress={() => R.navigate('Productivity')}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-cabinet-medium text-black mb-1">Ready to focus?</Text>
                <Text className="text-sm font-cabinet text-gray-600">Start a Pomodoro session</Text>
              </View>
              <Text className="text-2xl">⏰</Text>
            </View>
          </Card>
        </View>

        <View className="px-4 mb-2">
          <Text className="text-[24px] font-cabinet-bold text-black">Transactions</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 mx-4 mb-6">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              name={transaction.name}
              date={transaction.date}
              amount={transaction.amount}
              type={transaction.type}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
