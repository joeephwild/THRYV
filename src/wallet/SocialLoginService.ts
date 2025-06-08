import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import walletService from './WalletService';

// Storage keys
const SOCIAL_AUTH_TOKEN = 'SOCIAL_AUTH_TOKEN';
const SOCIAL_USER_INFO = 'SOCIAL_USER_INFO';

// Social login types
export enum SocialLoginType {
  GOOGLE = 'google',
  APPLE = 'apple',
  EMAIL = 'email'
}

// User info interface
export interface SocialUserInfo {
  id: string;
  email?: string;
  name?: string;
  profileImage?: string;
  loginType: SocialLoginType;
}

class SocialLoginService {
  private isLoggedIn: boolean = false;
  private userInfo: SocialUserInfo | null = null;
  
  constructor() {
    // Initialize by checking if user is already logged in
    this.checkLoginStatus();
  }
  
  /**
   * Check if user is already logged in
   */
  private async checkLoginStatus(): Promise<void> {
    try {
      const authToken = await AsyncStorage.getItem(SOCIAL_AUTH_TOKEN);
      const userInfoStr = await AsyncStorage.getItem(SOCIAL_USER_INFO);
      
      if (authToken && userInfoStr) {
        this.isLoggedIn = true;
        this.userInfo = JSON.parse(userInfoStr);
      } else {
        this.isLoggedIn = false;
        this.userInfo = null;
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      this.isLoggedIn = false;
      this.userInfo = null;
    }
  }
  
  /**
   * Login with a social provider
   * In a real implementation, this would integrate with Web3Auth or similar
   */
  async login(loginType: SocialLoginType): Promise<SocialUserInfo> {
    try {
      // This is a simplified mock implementation
      // In a real app, you would integrate with Web3Auth or similar service
      
      // Simulate a successful login
      const mockUserInfo: SocialUserInfo = {
        id: `user_${Date.now()}`,
        email: `user_${Date.now()}@example.com`,
        name: `User ${Date.now()}`,
        profileImage: 'https://i.pravatar.cc/150',
        loginType: loginType
      };
      
      // Generate a mock auth token
      const mockAuthToken = ethers.utils.id(JSON.stringify(mockUserInfo));
      
      // Save to storage
      await AsyncStorage.setItem(SOCIAL_AUTH_TOKEN, mockAuthToken);
      await AsyncStorage.setItem(SOCIAL_USER_INFO, JSON.stringify(mockUserInfo));
      
      // Update state
      this.isLoggedIn = true;
      this.userInfo = mockUserInfo;
      
      // Initialize wallet if not already done
      const walletExists = await walletService.walletExists();
      if (!walletExists) {
        // Create a new wallet
        const wallet = await walletService.createNewWallet();
        
        // Create an AA wallet
        await walletService.createAAWallet(wallet.address);
      } else {
        // Just initialize the existing wallet
        await walletService.initializeWallet();
      }
      
      return mockUserInfo;
    } catch (error) {
      console.error('Error during social login:', error);
      throw new Error('Failed to login with social provider');
    }
  }
  
  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Clear social login data
      await AsyncStorage.removeItem(SOCIAL_AUTH_TOKEN);
      await AsyncStorage.removeItem(SOCIAL_USER_INFO);
      
      // Clear wallet data
      await walletService.clearWallet();
      
      // Update state
      this.isLoggedIn = false;
      this.userInfo = null;
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Failed to logout');
    }
  }
  
  /**
   * Check if user is logged in
   */
  isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }
  
  /**
   * Get user info
   */
  getUserInfo(): SocialUserInfo | null {
    return this.userInfo;
  }
  
  /**
   * Get auth token
   */
  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(SOCIAL_AUTH_TOKEN);
  }
}

// Export as singleton
export const socialLoginService = new SocialLoginService();
export default socialLoginService;
