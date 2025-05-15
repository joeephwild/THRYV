import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Share,
  DeviceEventEmitter,
  Platform,
  Switch,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ProductivityScreen: React.FC = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} className="ml-4">
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
      ),
      title: 'Productivity',
      headerTitleAlign: 'center',
    });
  }, [navigation]);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [studyDuration, setStudyDuration] = useState(25); // in minutes
  const [blockNotifications, setBlockNotifications] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Load saved settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedDuration = await AsyncStorage.getItem('studyDuration');
      const savedNotificationSetting = await AsyncStorage.getItem('blockNotifications');

      if (savedDuration) setStudyDuration(parseInt(savedDuration));
      if (savedNotificationSetting) setBlockNotifications(savedNotificationSetting === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('studyDuration', studyDuration.toString());
      await AsyncStorage.setItem('blockNotifications', blockNotifications.toString());
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0 && !isAppLocked) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? studyDuration * 60 : 5 * 60);
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, isAppLocked, studyDuration]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(studyDuration * 60);
    setIsRunning(false);
    setIsBreak(false);
  };

  const toggleAppLock = () => {
    if (!isAppLocked) {
      // Enable app lock
      if (blockNotifications) {
        // Disable notifications
        DeviceEventEmitter.emit('blockNotifications', true);
      }
    } else {
      // Disable app lock
      DeviceEventEmitter.emit('blockNotifications', false);
    }
    setIsAppLocked(!isAppLocked);
  };

  const adjustStudyDuration = (increment: boolean) => {
    setStudyDuration(current => {
      const newValue = increment ? current + 5 : current - 5;
      // Limit between 5 minutes and 120 minutes (2 hours)
      return Math.min(Math.max(newValue, 5), 120);
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInviteFriends = async () => {
    try {
      await Share.share({
        message:
          'Join me for a focus session on Thryv! Let\'s boost our productivity together. Download Thryv: [Your App Link Here]',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="flex-1 px-4 py-6">
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-[32px] font-cabinet-bold text-black text-center flex-1">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-gray-200"
            >
              <Text className="text-2xl">⚙️</Text>
            </TouchableOpacity>
          </View>

       
          <Modal
            animationType="slide"
            transparent={true}
            visible={showSettings}
            onRequestClose={() => setShowSettings(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
              <View className="bg-white p-6 rounded-2xl w-[90%] max-w-md">
                <Text className="text-2xl font-cabinet-bold mb-6">Study Settings</Text>

                <View className="mb-6">
                  <Text className="text-lg mb-4">Study Duration: {studyDuration} minutes</Text>
                  <View className="flex-row justify-center items-center space-x-4">
                    <TouchableOpacity
                      onPress={() => adjustStudyDuration(false)}
                      className="bg-gray-200 p-3 rounded-full"
                    >
                      <Text className="text-xl">-</Text>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold">{studyDuration}</Text>
                    <TouchableOpacity
                      onPress={() => adjustStudyDuration(true)}
                      className="bg-gray-200 p-3 rounded-full"
                    >
                      <Text className="text-xl">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-lg">Block Notifications</Text>
                  <Switch
                    value={blockNotifications}
                    onValueChange={setBlockNotifications}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => {
                    saveSettings();
                    setShowSettings(false);
                    resetTimer();
                  }}
                  className="bg-blue-500 p-4 rounded-xl"
                >
                  <Text className="text-white text-center font-bold">Save Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View className="flex-1 justify-center items-center">
            <View className="w-72 h-72 rounded-full border-8 border-[#B8FFED] justify-center items-center bg-white shadow-lg mb-8">
              <Text className="text-[64px] font-cabinet-bold text-black">
                {formatTime(timeLeft)}
              </Text>
            </View>

            <View className="flex-row justify-center space-x-4 mb-8">
              <TouchableOpacity
                onPress={toggleTimer}
                disabled={isAppLocked} // Disable timer controls when app is locked
                className={`px-8 py-4 rounded-full ${isRunning ? 'bg-red-400' : 'bg-[#B8FFED]'} shadow-md border-b-4 border-l-2 border-r-2 border-t-2 border-[#0A0B0F] ${isAppLocked ? 'opacity-50' : ''}`}
              >
                <Text className="text-lg font-cabinet-bold text-black">
                  {isRunning ? 'Pause' : 'Start'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={resetTimer}
                disabled={isAppLocked} // Disable timer controls when app is locked
                className={`px-8 py-4 rounded-full bg-gray-200 shadow-md border-b-4 border-l-2 border-r-2 border-t-2 border-[#0A0B0F] ${isAppLocked ? 'opacity-50' : ''}`}
              >
                <Text className="text-lg font-cabinet-bold text-black">Reset</Text>
              </TouchableOpacity>
            </View>

            {/* New Buttons for Lock App and Invite Friends */}
            <View className="flex-row justify-center space-x-4 mb-8">
              <TouchableOpacity
                onPress={toggleAppLock}
                className="px-6 py-3 rounded-full bg-orange-400 shadow-md border-b-4 border-l-2 border-r-2 border-t-2 border-[#0A0B0F]"
              >
                <Text className="text-md font-cabinet-bold text-black">
                  {isAppLocked ? 'Unlock App' : 'Lock App'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleInviteFriends}
                disabled={isAppLocked} // Disable invite when app is locked
                className={`px-6 py-3 rounded-full bg-purple-400 shadow-md border-b-4 border-l-2 border-r-2 border-t-2 border-[#0A0B0F] ${isAppLocked ? 'opacity-50' : ''}`}
              >
                <Text className="text-md font-cabinet-bold text-black">Invite Friends</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* App Lock Modal - This should be outside of the ScrollView */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isAppLocked}
        onRequestClose={toggleAppLock} // Allows back button to close modal on Android
      >
        <View className="flex-1 justify-center items-center bg-gray-800 bg-opacity-90">
          <Text className="text-[48px] font-cabinet-bold text-white mb-8">App Locked</Text>
          <Text className="text-lg text-gray-200 mb-12 px-8 text-center">
            Focus mode is active. Unlock to access other features.
          </Text>
          <TouchableOpacity
            onPress={toggleAppLock}
            className="px-12 py-4 rounded-full bg-red-500 shadow-lg border-b-4 border-l-2 border-r-2 border-t-2 border-[#0A0B0F]"
          >
            <Text className="text-xl font-cabinet-bold text-white">Unlock</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductivityScreen;
