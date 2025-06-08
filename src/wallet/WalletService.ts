import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Presets } from 'userop'; // Updated import for Nero UserOpSDK
import 'react-native-get-random-values';

// Constants for NERO Chain
export const NERO_CHAIN_ID = 7777; // TODO: Update this with the correct NERO Chain ID
export const NERO_RPC_URL = 'https://rpc-testnet.nerochain.io';
export const NERO_BUNDLER_URL = 'https://bundler-testnet.nerochain.io/';
export const NERO_PAYMASTER_URL = 'https://paymaster-testnet.nerochain.io';
export const NERO_ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
export const NERO_SIMPLE_ACCOUNT_FACTORY_ADDRESS = '0x9406Cc6185a346906296840746125a0E44976454';

// Storage keys
const WALLET_PRIVATE_KEY = 'WALLET_PRIVATE_KEY';
const WALLET_ADDRESS = 'WALLET_ADDRESS';
const USER_ACCOUNT_ADDRESS = 'USER_ACCOUNT_ADDRESS';

class WalletService {
  private provider: ethers.providers.JsonRpcProvider;
  private client: Client | null = null;
  private wallet: ethers.Wallet | null = null; // EOA wallet (signer)
  private simpleAccount: Presets.Builder.SimpleAccount | null = null; // AA wallet
  private accountAddress: string | null = null; // AA wallet address

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(NERO_RPC_URL);
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

      // Initialize Nero Client
      if (!this.client) {
        if (!NERO_ENTRY_POINT_ADDRESS || NERO_ENTRY_POINT_ADDRESS.startsWith('YOUR_')) {
          console.warn('NERO_ENTRY_POINT_ADDRESS is not set. AA wallet functionality will be limited.');
          // throw new Error('NERO_ENTRY_POINT_ADDRESS is not configured.');
        } else {
          // Initialize Nero Client with entry point and paymaster if configured
          const clientOptions: any = {};
          if (NERO_PAYMASTER_URL && !NERO_PAYMASTER_URL.startsWith('YOUR_')) {
            clientOptions.paymasterRpc = NERO_PAYMASTER_URL;
          }
          // Add NERO_ENTRY_POINT_ADDRESS to clientOptions
          clientOptions.entryPoint = NERO_ENTRY_POINT_ADDRESS;
          this.client = await Client.init(NERO_RPC_URL, clientOptions);
          console.log('Nero Client initialized.');
        }
      }

      // Initialize SimpleAccount (AA wallet)
      const storedAAAddress = await AsyncStorage.getItem(USER_ACCOUNT_ADDRESS);

      if (this.wallet && NERO_ENTRY_POINT_ADDRESS && !NERO_ENTRY_POINT_ADDRESS.startsWith('YOUR_') && NERO_SIMPLE_ACCOUNT_FACTORY_ADDRESS && !NERO_SIMPLE_ACCOUNT_FACTORY_ADDRESS.startsWith('YOUR_')) {
        const simpleAccountOpts: any = {
          entryPoint: NERO_ENTRY_POINT_ADDRESS,
          factory: NERO_SIMPLE_ACCOUNT_FACTORY_ADDRESS,
        };
        if (NERO_PAYMASTER_URL && !NERO_PAYMASTER_URL.startsWith('YOUR_')) {
          // This configures SimpleAccount to use the paymaster via the client's paymasterRpc or specific middleware
          // For userop v0.6+, paymasterRpc is passed to Client.init, and SimpleAccount uses that client.
          // If direct paymaster middleware is needed for SimpleAccount, it would be set here.
          // For now, relying on Client's paymasterRpc configuration.

          console.log('SimpleAccount will attempt to use paymaster via Client config with URL:', NERO_PAYMASTER_URL);
        }

        this.simpleAccount = await Presets.Builder.SimpleAccount.init(
          this.wallet, // Signer
          NERO_RPC_URL, // RPC URL
          simpleAccountOpts
        );
        this.accountAddress = this.simpleAccount.getSender();
        console.log('AA Wallet initialized/retrieved:', this.accountAddress);

        if (storedAAAddress !== this.accountAddress) {
          await AsyncStorage.setItem(USER_ACCOUNT_ADDRESS, this.accountAddress);
        }
      } else {
        console.warn('Nero EntryPoint or Factory Address not configured. Using stored AA address if available.');
        this.accountAddress = storedAAAddress;
      }

      return {
        wallet: this.wallet!,
        accountAddress: this.accountAddress,
      };
    } catch (error) {
      console.error('Error initializing wallet:', error);
      Alert.alert('Wallet Initialization Error', 'Could not initialize Nero AA wallet. Please check configuration. Falling back to EOA if possible.');
      // Fallback to EOA if AA fails but EOA exists
      if (this.wallet) {
        console.warn('AA Wallet initialization failed, returning EOA wallet only.');
        return { wallet: this.wallet, accountAddress: await AsyncStorage.getItem(WALLET_ADDRESS) }; // Return EOA address as accountAddress if AA fails
      }
      throw new Error('Failed to initialize any wallet');
    }
  }

  /**
   * Create a new wallet and save to storage
   */
  async createNewWallet(): Promise<ethers.Wallet> {
    try {
      // Generate a new random wallet
      this.wallet = ethers.Wallet.createRandom().connect(this.provider);

      // Save the private key securely
      await AsyncStorage.setItem(WALLET_PRIVATE_KEY, this.wallet.privateKey);
      await AsyncStorage.setItem(WALLET_ADDRESS, this.wallet.address);

      return this.wallet;
    } catch (error) {
      console.error('Error creating new wallet:', error);
      throw new Error('Failed to create new wallet');
    }
  }

  // createAAWallet is now integrated into initializeWallet using SimpleAccount.init
  // This method can be removed or repurposed if explicit re-creation is needed.

  /**
   * Get the initialized SimpleAccount instance.
   */
  getSimpleAccount(): Presets.Builder.SimpleAccount | null {
    return this.simpleAccount;
  }

  /**
   * Get the initialized Client instance.
   */
  getClient(): Client | null {
    return this.client;
  }

  /**
   * Get the current wallet
   */
  getWallet(): ethers.Wallet | null {
    return this.wallet;
  }

  /**
   * Get the AA account address
   */
  getAccountAddress(): string | null {
    return this.accountAddress;
  }

  /**
   * Clear wallet data (for logout)
   */
  async clearWallet(): Promise<void> {
    await AsyncStorage.removeItem(WALLET_PRIVATE_KEY);
    await AsyncStorage.removeItem(WALLET_ADDRESS);
    await AsyncStorage.removeItem(USER_ACCOUNT_ADDRESS);
    this.wallet = null;
    this.simpleAccount = null;
    this.accountAddress = null;
    this.client = null; // Reset client as well
  }

  /**
   * Check if wallet exists
   */
  async walletExists(): Promise<boolean> {
    const privateKey = await AsyncStorage.getItem(WALLET_PRIVATE_KEY);
    return !!privateKey;
  }

  /**
   * Get wallet balance
   */
  async getBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || this.accountAddress || this.wallet?.address;
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
