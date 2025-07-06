import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';

// Storage keys
const WALLET_PRIVATE_KEY = 'WALLET_PRIVATE_KEY';
const WALLET_ADDRESS = 'WALLET_ADDRESS';

class WalletService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null; // EOA wallet (signer)

  constructor() {
    // Using a default provider for Ethereum mainnet
    this.provider = new ethers.providers.JsonRpcProvider();
  }

  /**
   * Initialize wallet from storage or create a new one
   */
  async initializeWallet(): Promise<{ wallet: ethers.Wallet; accountAddress: string | null }> {
    try {
      // Initialize EOA wallet (signer)
      const privateKey = await AsyncStorage.getItem(WALLET_PRIVATE_KEY);
      if (privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        console.log('EOA Wallet loaded from storage:', this.wallet.address);
      } else {
        await this.createNewWallet(); // Creates and sets this.wallet
        console.log('New EOA wallet created:', this.wallet!.address);
      }

      // For now, we're just using the EOA wallet address as the account address
      const walletAddress = this.wallet ? this.wallet.address : null;
      await AsyncStorage.setItem(WALLET_ADDRESS, walletAddress || '');

      return {
        wallet: this.wallet!,
        accountAddress: walletAddress,
      };
    } catch (error) {
      console.error('Error initializing wallet:', error);
      Alert.alert('Wallet Initialization Error', 'Could not initialize wallet. Please try again.');
      throw new Error('Failed to initialize wallet');
    }
  }

  /**
   * Create a new wallet
   */
  async createNewWallet(): Promise<{
    eoaAddress: string;
  }> {
    try {
      // Create a new random wallet
      const randomWallet = ethers.Wallet.createRandom();
      const privateKey = randomWallet.privateKey;

      // Store the private key securely
      await AsyncStorage.setItem(WALLET_PRIVATE_KEY, privateKey);
      await AsyncStorage.setItem(WALLET_ADDRESS, randomWallet.address);

      // Initialize the wallet with the new private key
      await this.initializeWallet();

      if (!this.wallet) {
        throw new Error('Failed to initialize wallet after creation');
      }

      return {
        eoaAddress: this.wallet.address,
      };
    } catch (error) {
      console.error('Error creating new wallet:', error);
      throw new Error('Failed to create new wallet');
    }
  }

  /**
   * Get the current wallet
   */
  getWallet(): ethers.Wallet | null {
    return this.wallet;
  }

  /**
   * Get the wallet address
   */
  getAccountAddress(): string | null {
    return this.wallet ? this.wallet.address : null;
  }

  /**
   * Clear wallet data (for logout)
   */
  async clearWallet(): Promise<void> {
    await AsyncStorage.removeItem(WALLET_PRIVATE_KEY);
    await AsyncStorage.removeItem(WALLET_ADDRESS);
    this.wallet = null;
  }

  /**
   * Check if wallet exists in storage
   */
  async walletExists(): Promise<boolean> {
    try {
      const privateKey = await AsyncStorage.getItem(WALLET_PRIVATE_KEY);
      return !!privateKey;
    } catch (error) {
      console.error('Error checking if wallet exists:', error);
      return false;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || this.wallet?.address;
      if (!targetAddress) throw new Error('No wallet address available');

      const balance = await this.provider.getBalance(targetAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }
}

import { Alert } from 'react-native'; // Added Alert for error reporting

// Export as singleton
export const walletService = new WalletService();
export default walletService;
