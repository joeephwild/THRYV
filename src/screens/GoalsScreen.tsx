import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal
} from 'react-native';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
}

const GoalsScreen: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'School Fees',
      targetAmount: 2500,
      currentAmount: 1250,
      deadline: 'Sep 30, 2025',
      icon: '🎓',
    },
    {
      id: '2',
      name: 'New Laptop',
      targetAmount: 1200,
      currentAmount: 450,
      deadline: 'Jul 15, 2025',
      icon: '💻',
    },
    {
      id: '3',
      name: 'Summer Trip',
      targetAmount: 800,
      currentAmount: 200,
      deadline: 'Jun 1, 2025',
      icon: '✈️',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    icon: '🎯',
  });

  const calculateProgress = (current: number, target: number): number => {
    return (current / target) * 100;
  };

  const handleAddGoal = () => {
    if (
      newGoal.name.trim() === '' || 
      newGoal.targetAmount === '' || 
      newGoal.deadline === ''
    ) {
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline,
      icon: newGoal.icon,
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      targetAmount: '',
      deadline: '',
      icon: '🎯',
    });
    setModalVisible(false);
  };

  const renderGoalCard = (goal: Goal) => {
    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
    
    return (
      <TouchableOpacity 
        key={goal.id}
        className="bg-white rounded-2xl p-4 mb-4"
        activeOpacity={0.9}
      >
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mr-3">
            <Text className="text-2xl">{goal.icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-[#0A0B0F] mb-1 font-cabinet-bold">{goal.name}</Text>
            <Text className="text-sm text-gray-600">Due by {goal.deadline}</Text>
          </View>
        </View>
        
        <View className="flex-row items-baseline mb-2">
          <Text className="text-lg font-bold text-[#0A0B0F] mr-1 font-cabinet-bold">
            ${goal.currentAmount.toFixed(2)}
          </Text>
          <Text className="text-sm text-gray-600">
            of ${goal.targetAmount.toFixed(2)}
          </Text>
        </View>
        
        <View className="mb-4">
          <View className="h-2 bg-gray-200 rounded-full mb-1">
            <View 
              className="h-full bg-[#FF8A3D] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="text-sm text-gray-600">{Math.round(progress)}% complete</Text>
        </View>
        
        <View className="flex-row justify-between mx-1">
          <TouchableOpacity className="bg-[#FF8A3D] py-2.5 px-4 rounded-lg flex-1 mr-2 items-center">
            <Text className="text-white text-sm font-semibold font-cabinet-bold">Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity className="border border-[#FF8A3D] py-2.5 px-4 rounded-lg flex-1 ml-2 items-center">
            <Text className="text-[#FF8A3D] text-sm font-semibold font-cabinet-bold">
              Details
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-2">
          <Text className="text-[32px] font-cabinet-bold text-[#0A0B0F]">Savings Goals</Text>
        </View>
        
        <View className="flex-row justify-between px-4 mb-4">
          <View className="bg-white rounded-2xl p-4 items-center w-[30%]">
            <Text className="text-sm text-gray-600 mb-1">Total Saved</Text>
            <Text className="text-lg font-bold text-[#0A0B0F] font-cabinet-bold">
              ${goals.reduce((sum, goal) => sum + goal.currentAmount, 0).toFixed(2)}
            </Text>
          </View>
          <View className="bg-white rounded-2xl p-4 items-center w-[30%]">
            <Text className="text-sm text-gray-600 mb-1">Goals</Text>
            <Text className="text-lg font-bold text-[#0A0B0F] font-cabinet-bold">{goals.length}</Text>
          </View>
          <View className="bg-white rounded-2xl p-4 items-center w-[30%]">
            <Text className="text-sm text-gray-600 mb-1">Streak</Text>
            <Text className="text-lg font-bold text-[#0A0B0F] font-cabinet-bold">7 days</Text>
          </View>
        </View>
        
        <View className="px-4 mb-4">
          <View className="bg-[#FDDB33] rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-bold text-[#0A0B0F] font-cabinet-bold">Savings Streak</Text>
              <Text className="text-sm font-semibold text-[#0A0B0F] font-cabinet-medium">🔥 7 days</Text>
            </View>
            <Text className="text-sm text-[#0A0B0F]/80 mb-3">
              You've been saving consistently for 7 days. Keep it up to earn rewards!
            </Text>
            <View className="bg-black/10 rounded-lg p-2">
              <Text className="text-sm text-[#0A0B0F] text-center font-cabinet-medium">
                Next reward: 10 tokens at 10-day streak
              </Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center px-4 mb-2">
          <Text className="text-lg font-bold text-[#0A0B0F] font-cabinet-bold">Your Goals</Text>
          <TouchableOpacity 
            className="bg-[#FF8A3D] px-3 py-1.5 rounded-full"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-white text-sm font-semibold font-cabinet-medium">+ New Goal</Text>
          </TouchableOpacity>
        </View>
        
        <View className="px-4 pb-6">
          {goals.map(renderGoalCard)}
        </View>
      </ScrollView>
      
      {/* Add Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-5 w-[90%] max-h-[80%]">
            <Text className="text-lg font-bold text-[#0A0B0F] mb-5 text-center font-cabinet-bold">Create New Goal</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#0A0B0F] mb-2 font-cabinet-medium">Goal Name</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-3 py-2.5 text-base"
                value={newGoal.name}
                onChangeText={(text) => setNewGoal({...newGoal, name: text})}
                placeholder="e.g., New Laptop"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#0A0B0F] mb-2 font-cabinet-medium">Target Amount ($)</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-3 py-2.5 text-base"
                value={newGoal.targetAmount}
                onChangeText={(text) => setNewGoal({...newGoal, targetAmount: text})}
                placeholder="e.g., 1000"
                keyboardType="numeric"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#0A0B0F] mb-2 font-cabinet-medium">Deadline</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-3 py-2.5 text-base"
                value={newGoal.deadline}
                onChangeText={(text) => setNewGoal({...newGoal, deadline: text})}
                placeholder="e.g., Dec 31, 2025"
              />
            </View>
            
            <View className="mb-5">
              <Text className="text-sm font-semibold text-[#0A0B0F] mb-2 font-cabinet-medium">Choose an Icon</Text>
              <View className="flex-row flex-wrap mt-2">
                {['🎯', '💰', '🏠', '🚗', '✈️', '🎓', '💻', '📱'].map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    className={`w-[50px] h-[50px] rounded-full justify-center items-center m-1 ${newGoal.icon === icon ? 'bg-[#FF8A3D]' : 'bg-gray-100'}`}
                    onPress={() => setNewGoal({...newGoal, icon})}
                  >
                    <Text className="text-2xl">{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="bg-gray-100 py-3 rounded-lg flex-1 mx-1 items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-[#0A0B0F] text-base font-semibold font-cabinet-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-[#FF8A3D] py-3 rounded-lg flex-1 mx-1 items-center"
                onPress={handleAddGoal}
              >
                <Text className="text-white text-base font-semibold font-cabinet-medium">Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};



export default GoalsScreen;
