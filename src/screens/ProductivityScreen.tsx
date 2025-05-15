import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

const ProductivityScreen: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(25 * 60);
    setIsRunning(false);
    setIsBreak(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 py-6">
        <Text className="text-[32px] font-cabinet-bold text-black mb-8 text-center">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </Text>

        <View className="flex-1 justify-center items-center">
          <View className="w-72 h-72 rounded-full border-8 border-[#B8FFED] justify-center items-center bg-white shadow-lg mb-8">
            <Text className="text-[64px] font-cabinet-bold text-black">
              {formatTime(timeLeft)}
            </Text>
          </View>

          <View className="flex-row justify-center space-x-4">
            <TouchableOpacity
              onPress={toggleTimer}
              className={`px-8 py-4 rounded-full ${isRunning ? 'bg-red-400' : 'bg-[#B8FFED]'} shadow-md border-b-4 border-l-2 border-r-2 border-t-2 border-[#0A0B0F]`}
            >
              <Text className="text-lg font-cabinet-bold text-black">
                {isRunning ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetTimer}
              className="px-8 py-4 rounded-full bg-gray-200 shadow-md border-b-4 border-l-2 border-r-2 border-t-2 border-[#0A0B0F]"
            >
              <Text className="text-lg font-cabinet-bold text-black">Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductivityScreen;
