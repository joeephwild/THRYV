import { ethers } from 'ethers';
import walletService from './WalletService';

class AccountAbstractionService {
  constructor() {}


  /**
   * Create a user operation with the specified payment type
   */
  // createUserOperation, applySponsoredPaymaster, applyCustomTokenPaymaster, and sendUserOperation
  // are now effectively handled by simpleAccount.sendUserOperation and the client configuration in WalletService.
  // These can be removed.



  /**
   * Execute a transaction
   */
  async executeTransaction(
    target: string,
    data: string,
    value: ethers.BigNumber = ethers.BigNumber.from(0)
  ): Promise<string> {
    try {
      const wallet = walletService.getWallet();
      if (!wallet) {
        throw new Error('Wallet not initialized');
      }

      // Create transaction
      const tx = {
        to: target,
        value: value,
        data: data,
      };

      // Send transaction
      const response = await wallet.sendTransaction(tx);
      console.log('Transaction sent, hash:', response.hash);

      // Wait for transaction to be mined
      const receipt = await response.wait();
      console.log('Transaction mined, receipt:', receipt);

      return response.hash;
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw new Error('Failed to execute transaction');
    }
  }

  /**
   * Transfer tokens
   */
  async transferTokens(
    tokenAddress: string,
    to: string,
    amount: ethers.BigNumber
  ): Promise<string> {
    try {
      // Standard ERC20 interface for encoding transfer function call
      const erc20Interface = new ethers.utils.Interface([
        'function transfer(address to, uint256 amount) returns (bool)'
      ]);
      const callData = erc20Interface.encodeFunctionData('transfer', [to, amount]);

      return await this.executeTransaction(
        tokenAddress, // Target is the token contract address
        callData,
        ethers.BigNumber.from(0) // Value is 0 for token transfers
      );
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw new Error('Failed to transfer tokens');
    }
  }
}

// Export as singleton
export const accountAbstractionService = new AccountAbstractionService();
export default accountAbstractionService;
