import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface TabIconProps {
  focused: boolean;
  iconComponent: React.ReactNode;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, iconComponent }) => {
  return (
    <View >
      <View>
        {iconComponent}
      </View>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
    screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF7700",
        tabBarInactiveTintColor: "#787A80",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          height: Platform.OS === "android" ? 70 : 80,
          borderTopWidth: 0,
        },
        tabBarIconStyle: { marginTop: Platform.OS === "android" ? 10 : 8 },
        headerStyle: {
          backgroundColor: "#040405",
          height: 109,
          borderBottomColor: "#1D2029",
        },
        tabBarPosition: "bottom",
        
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              iconComponent={
                <Ionicons
                  name="home"
                  size={24}
                  color={focused ? '#FF8A3D' : '#6B7280'}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="invest"
        options={{
          title: 'Invest',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              iconComponent={
                <FontAwesome5
                  name="chart-line"
                  size={22}
                  color={focused ? '#FF8A3D' : '#6B7280'}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: 'Savings',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              iconComponent={
                <Ionicons
                  name="server-outline" // Placeholder for savings/vault icon
                  size={24}
                  color={focused ? '#FF8A3D' : '#6B7280'}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              iconComponent={
                <Ionicons
                  name="book-outline"
                  size={24}
                  color={focused ? '#FF8A3D' : '#6B7280'}
                />
              }
            />
          ),
        }}
      />
      {/* New Progress Tab */}
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              iconComponent={
                <Ionicons
                  name="flame-outline" // Icon for streaks/progress
                  size={24}
                  color={focused ? COLORS.primary : '#6B7280'}
                />
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              iconComponent={
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={24}
                  color={focused ? '#FF8A3D' : '#6B7280'}
                />
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}
