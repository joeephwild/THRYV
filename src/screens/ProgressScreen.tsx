import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONT } from '../constants/theme'; // Ensure this path is correct

const ProgressScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>Your Progress</Text>

        {/* Streaks Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitleText}>Saving Streaks <Ionicons name="flame-outline" size={SIZES.xLarge} color={COLORS.primary} /></Text>
          <View style={styles.streakItem}>
            <Text style={styles.streakText}>Current Daily Streak:</Text>
            <Text style={styles.streakValueText}>{user.streak} {user.streak === 1 ? 'day' : 'days'}</Text>
          </View>
          <View style={styles.streakItem}>
            <Text style={styles.streakText}>Longest Daily Streak:</Text>
            <Text style={styles.streakValueText}>{user.longestStreak} {user.longestStreak === 1 ? 'day' : 'days'}</Text>
          </View>
        </View>

        {/* Lessons Section (Placeholder) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitleText}>Learning Hub <Ionicons name="book-outline" size={SIZES.xLarge} color={COLORS.secondary} /></Text>
          <Text style={styles.placeholderText}>Your started lessons will appear here soon!</Text>
        </View>

        {/* Investments Section (Placeholder) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitleText}>Investments <Ionicons name="analytics-outline" size={SIZES.xLarge} color={COLORS.yellow} /></Text>
          <Text style={styles.placeholderText}>Track your ongoing investments here.</Text>
        </View>

        {/* Share Button (Placeholder for Phase 2) */}
        {/* We will add this later */}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SIZES.medium,
  },
  headerText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xxLarge,
    color: COLORS.primary,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    marginBottom: SIZES.large,
    // Using SHADOWS.small for consistency if available, or keeping individual shadow props
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5, // For Android
  },
  sectionTitleText: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.darkGray,
    marginBottom: SIZES.medium,
    // flexDirection and alignItems are for View containers, not directly on Text unless it's a parent
  },
  streakItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  streakText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  streakValueText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
  placeholderText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
    paddingVertical: SIZES.medium,
  },
});

export default ProgressScreen;
