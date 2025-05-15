import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../constants/theme';
import StreakIndicator from '../components/StreakIndicator';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isWeb3Enabled, setIsWeb3Enabled] = useState(true);

  // Mock user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    walletAddress: '0x1234...5678',
    tokens: 145,
    streak: 7,
    joinDate: 'May 2025',
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleNotifications = () => setIsNotificationsEnabled(prev => !prev);
  const toggleWeb3 = () => setIsWeb3Enabled(prev => !prev);

  const handleLogout = () => {
    // In a real app, we would clear auth tokens and user data
    router.replace('/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.joinDate}>Member since {user.joinDate}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.tokens}</Text>
              <Text style={styles.statLabel}>Tokens</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <StreakIndicator days={user.streak} maxDays={7} showLabel={false} size="small" />
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Nerochain Testnet Wallet</Text>
            <Text style={styles.walletAddress}>{user.walletAddress}</Text>
            <View style={styles.walletActions}>
              <TouchableOpacity style={styles.walletButton}>
                <Text style={styles.walletButtonText}>View Transactions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.walletButton}>
                <Text style={styles.walletButtonText}>Copy Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Enable dark theme</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>Enable push notifications</Text>
              </View>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Web3 Features</Text>
                <Text style={styles.settingDescription}>Enable blockchain rewards</Text>
              </View>
              <Switch
                value={isWeb3Enabled}
                onValueChange={toggleWeb3}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.supportCard}>
            <TouchableOpacity style={styles.supportRow}>
              <Text style={styles.supportIcon}>📋</Text>
              <Text style={styles.supportText}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportRow}>
              <Text style={styles.supportIcon}>📞</Text>
              <Text style={styles.supportText}>Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportRow}>
              <Text style={styles.supportIcon}>📝</Text>
              <Text style={styles.supportText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportRow}>
              <Text style={styles.supportIcon}>🔒</Text>
              <Text style={styles.supportText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Thryv v1.0.0 (MVP)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: SIZES.xLarge,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: SIZES.xSmall,
    color: COLORS.darkGray,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.xSmall,
    color: COLORS.darkGray,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  walletCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  walletLabel: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 16,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  walletButtonText: {
    fontSize: SIZES.small,
    color: COLORS.black,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLabel: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  supportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  supportIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  supportText: {
    fontSize: SIZES.medium,
    color: COLORS.black,
  },
  logoutButton: {
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.red,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  versionText: {
    fontSize: SIZES.xSmall,
    color: COLORS.darkGray,
  },
});

export default ProfileScreen;
