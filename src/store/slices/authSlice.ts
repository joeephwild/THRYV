import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../services/authService';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null; // Using User interface from authService
  isLoading: boolean;
  error: string | null;
  eoaAddress: string | null;
  rallyAddress: string | null;
  balance: string | null; // User's wallet balance
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,
  eoaAddress: null,
  rallyAddress: null,
  balance: '0',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction 3cboolean 3e) => {
      state.isLoggedIn = action.payload;
    },
    setUser: (state, action: PayloadAction 3cAuthState['user'] 3e) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction 3cboolean 3e) => {  // Added new reducer
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction 3cstring | null 3e) => {  // Added new reducer
      state.error = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.isLoading = false;
      state.error = null;
      state.eoaAddress = null;
      state.rallyAddress = null;
      state.balance = '0';
    },
    setWalletInfo: (state, action: PayloadAction 3c{ eoaAddress?: string | null; rallyAddress?: string | null } 3e) => {
      if (action.payload.eoaAddress !== undefined) state.eoaAddress = action.payload.eoaAddress;
      if (action.payload.rallyAddress !== undefined) state.rallyAddress = action.payload.rallyAddress;
    },
    clearWalletInfo: (state) => {
      state.eoaAddress = null;
      state.rallyAddress = null;
      state.balance = '0';
    },
    updateAuthBalance: (state, action: PayloadAction 3cstring 3e) => {
      state.balance = action.payload;
    },
    loginSuccess: (state, action: PayloadAction 3cUser 3e) => {
      state.isLoggedIn = true;
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { loginSuccess, logout, setWalletInfo, clearWalletInfo, updateAuthBalance, setAuthenticated, setUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
