import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface CourseItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
}

const LearnScreen: React.FC = () => {
  // Mock data for courses
  const courses: CourseItem[] = [
    {
      id: '1',
      title: 'Banking Basics',
      description: 'Learn the fundamentals of banking and how to manage your accounts effectively.',
      duration: '15 min',
      level: 'Beginner',
      icon: '🏦',
    },
    {
      id: '2',
      title: 'Behavioral Finance',
      description: 'Understand how psychology affects your financial decisions and learn to make better choices.',
      duration: '20 min',
      level: 'Intermediate',
      icon: '🧠',
    },
    {
      id: '3',
      title: 'Investing Strategies',
      description: 'Discover different approaches to investing and building wealth over time.',
      duration: '25 min',
      level: 'Intermediate',
      icon: '📈',
    },
    {
      id: '4',
      title: 'Crypto Basics',
      description: 'Learn the fundamentals of cryptocurrencies and blockchain technology.',
      duration: '30 min',
      level: 'Beginner',
      icon: '₿',
    },
    {
      id: '5',
      title: 'Financial Goals',
      description: 'Set smart financial goals and create actionable plans to achieve them.',
      duration: '15 min',
      level: 'Beginner',
      icon: '🎯',
    },
  ];

  const renderCourseCard = (course: CourseItem) => {
    return (
      <TouchableOpacity
        key={course.id}
        className="bg-white border-b-8 border-l-4 border-r-2 border-t-2 border-[#0A0B0F] rounded-2xl p-4 mb-3 flex-row items-center"
        activeOpacity={0.8}
      >
        <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mr-3">
          <Text className="text-2xl">{course.icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-black mb-1">{course.title}</Text>
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {course.description}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-600 mr-2">{course.duration}</Text>
            <View className="bg-gray-100 px-2 py-0.5 rounded-lg">
              <Text className="text-xs text-black">{course.level}</Text>
            </View>
          </View>
        </View>
        <View className="ml-2">
          <Text className="text-xl text-gray-600">→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-black">Learning Lab</Text>
        </View>

        <View className="bg-yellow-400 m-4 rounded-2xl p-4 flex-row border-b-8 border-l-4 border-r-2 border-t-2 border-[#0A0B0F]">
          <View className="flex-3">
            <Text className="text-lg font-bold text-black mb-2">
              Become a finance expert
            </Text>
            <Text className="text-sm text-black opacity-80 mb-4">
              Take bite-sized courses on all things finance, from banking basics to investing strategies.
            </Text>
            <TouchableOpacity className="bg-black px-4 py-2 rounded-full self-start">
              <Text className="text-white font-semibold text-sm">Get started</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center items-center">
            <Text className="text-4xl">🚀</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center px-4 mb-2">
          <Text className="text-lg font-bold text-black">Popular Courses</Text>
          <TouchableOpacity>
            <Text className="text-sm text-blue-600 font-medium">View all</Text>
          </TouchableOpacity>
        </View>

        <View className="px-4">
          {courses.map(renderCourseCard)}
        </View>

        <View className="bg-white m-4 rounded-2xl p-4 mt-2 border-b-8 border-l-4 border-r-2 border-t-2 border-[#0A0B0F]">
          <Text className="text-lg font-bold text-black mb-4">Your Achievements</Text>
          <View className="mb-4">
            <View className="h-2 bg-gray-100 rounded mb-2">
              <View className="h-full bg-blue-600 rounded w-[35%]" />
            </View>
            <Text className="text-sm text-gray-600">3/8 courses completed</Text>
          </View>
          <View className="flex-row justify-between">
            <View className="items-center w-[30%]">
              <Text className="text-3xl mb-2">🏆</Text>
              <Text className="text-sm text-black text-center">Finance Rookie</Text>
            </View>
            <View className="items-center w-[30%]">
              <Text className="text-3xl mb-2">🌟</Text>
              <Text className="text-sm text-black text-center">5-Day Streak</Text>
            </View>
            <View className="items-center w-[30%] opacity-50">
              <Text className="text-3xl mb-2">🔒</Text>
              <Text className="text-sm text-black text-center">Investor Pro</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LearnScreen;
