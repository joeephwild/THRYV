import { prisma } from '../index';

export class WalletService {
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
