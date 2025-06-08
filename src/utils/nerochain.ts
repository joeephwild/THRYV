import { ethers } from 'ethers';
import { Client, Presets } from 'userop';
import 'react-native-get-random-values';
import '@ethersproject/shims';

// Polyfill for crypto.getRandomValues
if (typeof global.crypto !== 'object') {
  // Using type assertion to avoid TypeScript errors
  (global as any).crypto = {
    getRandomValues: function<T extends ArrayBufferView | null>(array: T): T {
      if (array === null) return array;
      const buffer = array as unknown as Uint8Array;
      for (let i = 0; i < buffer.byteLength; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {} as SubtleCrypto,
    randomUUID: () => {
      // Simple UUID v4 implementation
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };
} else if (typeof global.crypto.getRandomValues !== 'function') {
  (global.crypto as any).getRandomValues = function<T extends ArrayBufferView | null>(array: T): T {
    if (array === null) return array;
    const buffer = array as unknown as Uint8Array;
    for (let i = 0; i < buffer.byteLength; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// Chain configuration
const NERO_RPC_URL = "https://rpc-testnet.nerochain.io";
const BUNDLER_URL = "https://bundler.service.nerochain.io";
const PAYMASTER_URL = "https://paymaster-testnet.nerochain.io";

// Contract addresses
const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const ACCOUNT_FACTORY_ADDRESS = "0x9406Cc6185a346906296840746125a0E44976454";

/**
 * Initialize the Nerochain UserOp SDK client
 */
export const initClient = async () => {
  try {
    // Initialize the AA Client
    const client = await Client.init(NERO_RPC_URL, {
      overrideBundlerRpc: BUNDLER_URL,
      entryPoint: ENTRYPOINT_ADDRESS,
    });
    
    return client;
  } catch (error) {
    console.error('Error initializing Nerochain client:', error);
    throw error;
  }
};

/**
 * Create a new wallet using the Nerochain UserOp SDK
 */
export const createWallet = async () => {
  try {
    // Create a random wallet
    const randomWallet = ethers.Wallet.createRandom();
    
    // Initialize the client
    const client = await initClient();
    
    // Create a SimpleAccount builder
    const builder = await Presets.Builder.SimpleAccount.init(
      randomWallet,
      NERO_RPC_URL,
      {
        overrideBundlerRpc: BUNDLER_URL,
        entryPoint: ENTRYPOINT_ADDRESS,
        factory: ACCOUNT_FACTORY_ADDRESS,
      }
    );
    
    // Get the account address
    const address = builder.getSender();
    
    // Return wallet info
    return {
      address,
      privateKey: randomWallet.privateKey,
      mnemonic: randomWallet.mnemonic.phrase,
    };
  } catch (error) {
    console.error('Error creating Nerochain wallet:', error);
    throw error;
  }
};

/**
 * Load an existing wallet using a private key
 */
export const loadWallet = async (privateKey: string) => {
  try {
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    
    // Initialize the client
    const client = await initClient();
    
    // Create a SimpleAccount builder
    const builder = await Presets.Builder.SimpleAccount.init(
      wallet,
      NERO_RPC_URL,
      {
        overrideBundlerRpc: BUNDLER_URL,
        entryPoint: ENTRYPOINT_ADDRESS,
        factory: ACCOUNT_FACTORY_ADDRESS,
      }
    );
    
    // Get the account address
    const address = builder.getSender();
    
    return { address, wallet };
  } catch (error) {
    console.error('Error loading Nerochain wallet:', error);
    throw error;
  }
};

/**
 * Add a paymaster to a transaction to make it gasless
 */
export const addPaymaster = (builder: any) => {
  try {
    // Create a custom paymaster middleware
    const paymasterMiddleware = async (context: any) => {
      const userOp = context.op;
      
      // Call the paymaster API
      const response = await fetch(PAYMASTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'pm_sponsorUserOperation',
          params: [userOp, ENTRYPOINT_ADDRESS],
        }),
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(`Paymaster error: ${data.error.message}`);
      }
      
      const paymasterAndData = data.result.paymasterAndData;
      context.op.paymasterAndData = paymasterAndData;
      
      return context;
    };
    
    builder.middleware(paymasterMiddleware);
    return builder;
  } catch (error) {
    console.error('Error adding paymaster:', error);
    throw error;
  }
};
