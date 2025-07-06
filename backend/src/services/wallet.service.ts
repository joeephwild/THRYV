import { Account } from '@massalabs/massa-web3';
import { prisma } from '../index';

export class WalletService {
  /**
   * Generate a new Massa wallet
   * @returns Object containing address, public key, and private key
   */
  static async generateMassaWallet() {
    try {
      const account = await Account.generate();
      
      return {
        address: account.address.toString(),
        publicKey: account.publicKey.toString(),
        privateKey: account.privateKey.toString(),
      };
    } catch (error) {
      console.error('Error generating Massa wallet:', error);
      throw new Error('Failed to generate Massa wallet');
    }
  }

  /**
   * Create a Massa wallet for a user and update their record
   * @param userId The ID of the user
   * @returns The wallet address
   */
  static async createUserMassaWallet(userId: string): Promise<string> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already has a wallet address
      if (user.walletAddress) {
        return user.walletAddress;
      }

      // Generate new Massa wallet
      const { address, publicKey, privateKey } = await this.generateMassaWallet();

      // Update user with wallet address
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { walletAddress: address },
      });

      // Store wallet details securely
      // In a production environment, you would encrypt the private key before storing
      // or use a secure vault service like AWS KMS or HashiCorp Vault
      
      // For now, we'll just return the address
      return updatedUser.walletAddress as string;
    } catch (error) {
      console.error('Error creating user Massa wallet:', error);
      throw new Error('Failed to create user Massa wallet');
    }
  }

  /**
   * Get a user's wallet address
   * @param userId The ID of the user
   * @returns The wallet address or null if not found
   */
  static async getUserWalletAddress(userId: string): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletAddress: true },
      });

      return user?.walletAddress || null;
    } catch (error) {
      console.error('Error getting user wallet address:', error);
      throw new Error('Failed to get user wallet address');
    }
  }
}