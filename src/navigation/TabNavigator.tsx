import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import InvestScreen from '../screens/InvestScreen';
import ProductivityScreen from '../screens/ProductivityScreen';
import LearnScreen from '../screens/LearnScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ProgressScreen from '../screens/ProgressScreen'; // <-- Import ProgressScreen
import { Tabs } from 'expo-router';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  focused: boolean;
  name: string;
  icon: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, name, icon }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{name}</Text>
    </View>
  );
};

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Home" icon="🏠" />
          ),
        }}
      />
      <Tab.Screen
        name="Invest"
        component={InvestScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Invest" icon="📈" />
          ),
        }}
      />
      <Tab.Screen
        name="Productivity"
        component={ProductivityScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Focus" icon="⏱️" />
          ),
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Learn" icon="📚" />
          ),
        }}
      />
      <Tab.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Assistant" icon="🤖" />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="Progress" icon="📊" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    elevation: 10,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabIconActive: {
    transform: [{ scale: 1.2 }],
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.darkGray,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default TabNavigator;
