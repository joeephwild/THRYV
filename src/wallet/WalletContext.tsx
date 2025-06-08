import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import walletService from './WalletService';
import accountAbstractionService, { PaymentType } from './AccountAbstractionService';
import { useDispatch, useSelector } from 'react-redux';
import { updateAuthBalance, setWalletInfo } from '../store/slices/authSlice'; // Changed to authSlice

interface WalletContextType {
  isInitialized: boolean;
  isLoading: boolean;
  eoaAddress: string | null; // EOA address (e.g., from Nero signer)
  aaAddress: string | null;  // Account Abstraction address (e.g., Nero SimpleAccount)
  rallyAddress: string | null; // Rally wallet address (if distinct)
  balance: string; // AA Wallet Balance
  executeTransaction: (
    target: string,
    data: string,
    value?: ethers.BigNumber,
    paymentType?: PaymentType
  ) => Promise<string>;
  transferTokens: (
    tokenAddress: string,
    to: string,
    amount: ethers.BigNumber,
    paymentType?: PaymentType
  ) => Promise<string>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  // Local state for context, will be synced with Redux
  const [isInitialized, setIsInitialized] = useState(false);
  // These will now primarily reflect values from Redux authSlice
  const [eoaAddress, setEoaAddress] = useState<string | null>(null);
  const [aaAddress, setAaAddress] = useState<string | null>(null);
  const [rallyAddress, setRallyAddress] = useState<string | null>(null);
  const [balance, setBalanceState] = useState('0'); // Renamed to avoid conflict with auth.balance

  const dispatch = useDispatch();
  const auth = useSelector((state: any) => state.auth); // Changed to auth state

  // Initialize wallet and sync with Redux state
  useEffect(() => {
    const initAndSyncWallet = async () => {
      setIsLoading(true);
      try {
        if (auth.isLoggedIn) {
          // WalletService.initializeWallet() is called in AuthScreen after login/signup.
          // Here, we primarily sync the context state with Redux state which should be populated by AuthScreen.

          setEoaAddress(auth.eoaAddress);
          setAaAddress(auth.aaAddress);
          setRallyAddress(auth.rallyAddress);

          if (auth.aaAddress) {
            await refreshBalanceInternal(auth.aaAddress); // Use internal refresh to avoid dependency loop issues
            setIsInitialized(true);
          } else {
            // If aaAddress is not yet available from Redux, it might still be initializing.
            // AuthScreen should eventually populate it.
            console.warn('WalletContext: AA address not yet available in Redux store. Balance will not be fetched yet.');
            setIsInitialized(false); // Not fully initialized if AA address is missing
          }
        } else {
          // Clear local state if user logs out
          setEoaAddress(null);
          setAaAddress(null);
          setRallyAddress(null);
          setBalanceState('0');
          setIsInitialized(false);
        }
      } catch (error) {
        console.error('Error in WalletContext initAndSyncWallet:', error);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAndSyncWallet();
  }, [auth.isLoggedIn, auth.eoaAddress, auth.aaAddress, auth.rallyAddress]); // Depend on Redux state

  // Effect to update local balance when Redux balance changes
  useEffect(() => {
    setBalanceState(auth.balance || '0');
  }, [auth.balance]);

  // Internal refresh balance function to be called by useEffect or public refreshBalance
  const refreshBalanceInternal = async (currentAaAddress: string | null) => {
    if (!currentAaAddress) {
      console.log('refreshBalanceInternal: No AA address, cannot refresh balance.');
      dispatch(updateAuthBalance('0'));
      return;
    }
    try {
      console.log('Refreshing balance for AA address:', currentAaAddress);
      const newBalance = await walletService.getBalance(currentAaAddress);
      dispatch(updateAuthBalance(newBalance)); // Dispatch to Redux
      // Local state setBalanceState will be updated by the useEffect listening to auth.balance
    } catch (error) {
      console.error('Error refreshing balance:', error);
      dispatch(updateAuthBalance('0')); // Reset balance on error
    }
  };

  // Public refresh balance function
  const refreshBalance = async () => {
    if (auth.aaAddress) {
      setIsLoading(true); // Indicate loading while refreshing
      await refreshBalanceInternal(auth.aaAddress);
      setIsLoading(false);
    } else {
      console.warn('refreshBalance called but no AA address is available.');
    }
  };

  // Execute transaction
  const executeTransaction = async (
    target: string,
    data: string,
    value: ethers.BigNumber = ethers.BigNumber.from(0),
    paymentType: PaymentType = PaymentType.SPONSORED
  ): Promise<string> => {
    return accountAbstractionService.executeTransaction(target, data, value, paymentType);
  };

  // Transfer tokens
  const transferTokens = async (
    tokenAddress: string,
    to: string,
    amount: ethers.BigNumber,
    paymentType: PaymentType = PaymentType.SPONSORED
  ): Promise<string> => {
    return accountAbstractionService.transferTokens(tokenAddress, to, amount, paymentType);
  };

  const value = {
    isInitialized,
    isLoading,
    eoaAddress: auth.eoaAddress, // Provide EOA from Redux
    aaAddress: auth.aaAddress,   // Provide AA from Redux
    rallyAddress: auth.rallyAddress, // Provide Rally from Redux
    balance: auth.balance || '0', // Provide balance from Redux
    executeTransaction,
    transferTokens,
    refreshBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;
