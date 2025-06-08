import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createWallet, loadWallet } from '../../utils/nerochain';

// Define transaction interface
interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'reward';
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  goalId?: string;
}

// Define wallet state interface
interface WalletState {
  address: string | null;
  balance: string;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  transactions: Transaction[];
}

// Initial state
const initialState: WalletState = {
  address: null,
  balance: '0',
  isInitialized: false,
  isLoading: false,
  error: null,
  transactions: []
};

// Async thunks
export const initializeWallet = createAsyncThunk(
  'wallet/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Check if wallet already exists
      const address = await AsyncStorage.getItem('walletAddress');
      const privateKey = await AsyncStorage.getItem('walletPrivateKey');
      
      if (address && privateKey) {
        // Wallet exists, load it
        const walletData = await loadWallet(privateKey);
        return {
          address: walletData.address,
          balance: '1000.00' // Mock balance for MVP
        };
      } else {
        // Create new wallet
        const wallet = await createWallet();
        
        // Store wallet info securely
        await AsyncStorage.setItem('walletAddress', wallet.address);
        await AsyncStorage.setItem('walletPrivateKey', wallet.privateKey);
        await AsyncStorage.setItem('walletMnemonic', wallet.mnemonic);
        
        return {
          address: wallet.address,
          balance: '1000.00' // Initial balance for new users
        };
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize wallet');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (goalId: string | undefined, { rejectWithValue }) => {
    try {
      // In a real app, we would fetch transactions from the blockchain
      // For the MVP, we'll use mock data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'deposit',
          amount: '100.00',
          timestamp: Date.now() - 86400000 * 2, // 2 days ago
          status: 'completed',
          description: 'Deposit to School Fees goal',
          goalId: 'school-fees'
        },
        {
          id: '2',
          type: 'reward',
          amount: '10.00',
          timestamp: Date.now() - 86400000, // 1 day ago
          status: 'completed',
          description: 'Streak reward: 4-week savings streak'
        },
        {
          id: '3',
          type: 'deposit',
          amount: '50.00',
          timestamp: Date.now() - 3600000 * 5, // 5 hours ago
          status: 'completed',
          description: 'Deposit to New Laptop goal',
          goalId: 'new-laptop'
        },
        {
          id: '4',
          type: 'reward',
          amount: '5.00',
          timestamp: Date.now() - 3600000 * 2, // 2 hours ago
          status: 'completed',
          description: 'Productivity reward: 5 focus sessions completed'
        }
      ];
      
      // Filter by goal ID if provided
      if (goalId) {
        return mockTransactions.filter(tx => tx.goalId === goalId);
      }
      
      return mockTransactions;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

// Create wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    resetWallet: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Initialize wallet
      .addCase(initializeWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.address = action.payload.address;
        state.balance = action.payload.balance;
      })
      .addCase(initializeWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { addTransaction, updateBalance, resetWallet } = walletSlice.actions;
export default walletSlice.reducer;
