import { Alert } from 'react-native';
import * as RlyMSDK from '@rly-network/mobile-sdk';
import 'react-native-get-random-values'; // Required for crypto operations

// You'll need to get API keys from https://app.rallyprotocol.com/
// and add them to your environment or configuration
const RALLY_API_KEY = ''; // Add your Rally API key here

class RallyWalletService {
  // Initialize the wallet for a new user
  async initializeWallet(): Promise<{ wallet: any; accountAddress: string }> {
    try {
      console.log('Initializing Rally Protocol wallet');
      
      // Initialize the Rally SDK
      await RlyMSDK.init({
        network: RlyMSDK.Network.Polygon,
        apiKey: RALLY_API_KEY,
      });
      
      // Create a new wallet
      const accountAddress = await RlyMSDK.register();
      console.log('Rally wallet created with account address:', accountAddress);
      
      // Get the wallet instance
      const wallet = {
        address: accountAddress,
        // Other wallet properties would go here
      };
      
      return { wallet, accountAddress };
    } catch (error) {
      console.error('Error creating Rally wallet:', error);
      Alert.alert(
        'Wallet Creation Failed',
        'There was an error creating your wallet. Please try again.'
      );
      throw new Error('Failed to create new wallet');
    }
  }
  
  // Get wallet for an existing user
  async getWallet(userId: string): Promise<{ wallet: any; accountAddress: string }> {
    try {
      console.log('Getting Rally wallet for user:', userId);
      
      // Initialize the Rally SDK
      await RlyMSDK.init({
        network: RlyMSDK.Network.Polygon,
        apiKey: RALLY_API_KEY,
      });
      
      // Get the existing wallet
      const accountAddress = await RlyMSDK.getAccountAddress();
      
      if (!accountAddress) {
        throw new Error('No wallet found for this user');
      }
      
      console.log('Retrieved Rally wallet with account address:', accountAddress);
      
      // Create wallet object
      const wallet = {
        address: accountAddress,
        // Other wallet properties would go here
      };
      
      return { wallet, accountAddress };
    } catch (error) {
      console.error('Error getting Rally wallet:', error);
      Alert.alert(
        'Wallet Retrieval Failed',
        'There was an error retrieving your wallet. Please try again.'
      );
      throw new Error('Failed to get wallet');
    }
  }
  
  // Send tokens to another address
  async sendTokens(toAddress: string, amount: number): Promise<string> {
    try {
      console.log(`Sending ${amount} tokens to ${toAddress}`);
      
      // Send tokens using Rally SDK
      const txHash = await RlyMSDK.send(toAddress, amount.toString());
      
      console.log('Transaction successful:', txHash);
      return txHash;
    } catch (error) {
      console.error('Error sending tokens:', error);
      Alert.alert(
        'Transaction Failed',
        'There was an error sending tokens. Please try again.'
      );
      throw new Error('Failed to send tokens');
    }
  }
  
  // Get token balance
  async getBalance(): Promise<string> {
    try {
      // Get balance using Rally SDK
      const balance = await RlyMSDK.getBalance();
      
      console.log('Current balance:', balance);
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      Alert.alert(
        'Balance Check Failed',
        'There was an error checking your balance. Please try again.'
      );
      throw new Error('Failed to get balance');
    }
  }
  
  // Claim tokens from faucet
  async claimTokens(): Promise<string> {
    try {
      // Claim tokens using Rally SDK
      const txHash = await RlyMSDK.claim();
      
      console.log('Tokens claimed successfully:', txHash);
      return txHash;
    } catch (error) {
      console.error('Error claiming tokens:', error);
      Alert.alert(
        'Token Claim Failed',
        'There was an error claiming tokens. Please try again.'
      );
      throw new Error('Failed to claim tokens');
    }
  }
}

// Export a singleton instance
const rallyWalletService = new RallyWalletService();
export default rallyWalletService;
