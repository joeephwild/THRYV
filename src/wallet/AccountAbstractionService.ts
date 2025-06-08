import { ethers } from 'ethers';
import walletService, { NERO_RPC_URL, NERO_PAYMASTER_URL } from './WalletService'; // NERO_PAYMASTER_URL might be used for specific paymaster logic if not handled by default client config
import { Client, Presets } from 'userop'; // Presets might not be directly used here if simpleAccount is retrieved from walletService

// Enum for payment types
export enum PaymentType {
  SPONSORED = 0,     // Fully sponsored by the paymaster
  CUSTOM_TOKEN = 1,  // Pay with a custom token
  USER_PAID = 2      // User pays with native token
}

class AccountAbstractionService {
  // Provider is no longer needed here as SimpleAccount and Client from WalletService will be used.
  constructor() {}

  private async getSimpleAccount(): Promise<Presets.Builder.SimpleAccount> {
    const simpleAccount = walletService.getSimpleAccount();
    if (!simpleAccount) {
      // Attempt to initialize walletService if simpleAccount is not ready
      // This might happen if AAService is used before WalletContext fully initializes WalletService
      console.warn('SimpleAccount not found in WalletService, attempting to initialize WalletService...');
      await walletService.initializeWallet();
      const newSimpleAccount = walletService.getSimpleAccount();
      if (!newSimpleAccount) {
        throw new Error('WalletService could not be initialized or SimpleAccount is not available. Ensure NERO_ENTRY_POINT_ADDRESS and NERO_SIMPLE_ACCOUNT_FACTORY_ADDRESS are correctly set.');
      }
      return newSimpleAccount;
    }
    return simpleAccount;
  }

  private async getClient(): Promise<Client> {
    const client = walletService.getClient();
    if (!client) {
      // Similar to getSimpleAccount, attempt re-initialization if client is missing.
      console.warn('Client not found in WalletService, attempting to initialize WalletService...');
      await walletService.initializeWallet();
      const newClient = walletService.getClient();
      if (!newClient) {
        throw new Error('WalletService could not be initialized or Client is not available. Ensure NERO_ENTRY_POINT_ADDRESS is correctly set.');
      }
      return newClient;
    }
    return client;
  }

  /**
   * Create a user operation with the specified payment type
   */
  // createUserOperation, applySponsoredPaymaster, applyCustomTokenPaymaster, and sendUserOperation
  // are now effectively handled by simpleAccount.sendUserOperation and the client configuration in WalletService.
  // These can be removed.



  /**
   * Execute a transaction using account abstraction
   */
  async executeTransaction(
    target: string,
    data: string,
    value: ethers.BigNumber = ethers.BigNumber.from(0),
    paymentType: PaymentType = PaymentType.SPONSORED
  ): Promise<string> {
    try {
      const simpleAccount = await this.getSimpleAccount();
      // const client = await this.getClient(); // Client might be needed for more complex scenarios or direct sendUserOperation calls

      // TODO: Implement robust PaymentType handling.
      // If PaymentType.USER_PAID, ensure no paymaster is used.
      // This might involve building the UserOp with specific options or using a different client/builder instance.
      // For now, assumes the default configuration of simpleAccount (via Client in WalletService) handles SPONSORED.
      if (paymentType === PaymentType.USER_PAID) {
        console.warn('USER_PAID payment type is not fully implemented to bypass paymaster. Transaction will use default paymaster if configured.');
        // To truly bypass, you might need to build UserOp manually and ensure paymasterAndData is '0x' or empty,
        // then send with client.sendUserOperation(op).
      } else if (paymentType === PaymentType.CUSTOM_TOKEN) {
        console.warn('CUSTOM_TOKEN payment type is not implemented. Transaction will use default paymaster if configured.');
      }

      const op = {
        to: target,
        value: value,
        data: data,
      };

      // simpleAccount.sendUserOperation will build, sign, and send the UserOperation.
      const userOpResponse = await simpleAccount.sendUserOperation(op);
      console.log('UserOperation sent, response:', userOpResponse);

      // The response from sendUserOperation is typically a UserOperationResponse object.
      // We need to wait for the transaction to be mined to get the actual transaction hash.
      const txHash = await userOpResponse.wait();
      console.log('Transaction mined, hash:', txHash);

      return txHash ? txHash.toString() : (userOpResponse.userOpHash || 'pending_userop_hash');
    } catch (error) {
      console.error('Error executing AA transaction:', error);
      throw new Error('Failed to execute AA transaction');
    }
  }

  /**
   * Transfer tokens using account abstraction
   */
  async transferTokens(
    tokenAddress: string,
    to: string,
    amount: ethers.BigNumber,
    paymentType: PaymentType = PaymentType.SPONSORED
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
        ethers.BigNumber.from(0), // Value is 0 for token transfers
        paymentType
      );
    } catch (error) {
      console.error('Error transferring tokens via AA:', error);
      throw new Error('Failed to transfer tokens via AA');
    }
  }
}

// Export as singleton
export const accountAbstractionService = new AccountAbstractionService();
export default accountAbstractionService;
