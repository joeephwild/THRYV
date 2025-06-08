import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  user: any | null; // Consider defining a User interface
  isLoading: boolean;
  error: string | null;
  eoaAddress: string | null;
  aaAddress: string | null;
  rallyAddress: string | null;
  balance: string | null; // User's AA wallet balance
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  isLoading: false,
  error: null,
  eoaAddress: null,
  aaAddress: null,
  rallyAddress: null,
  balance: '0',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload; // Changed isAuthenticated to isLoggedIn
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.isLoading = false;
      state.error = null;
      state.eoaAddress = null;
      state.aaAddress = null;
      state.rallyAddress = null;
      state.balance = '0';
    },
    setWalletInfo: (state, action: PayloadAction<{ eoaAddress?: string | null; aaAddress?: string | null; rallyAddress?: string | null }>) => {
      if (action.payload.eoaAddress !== undefined) state.eoaAddress = action.payload.eoaAddress;
      if (action.payload.aaAddress !== undefined) state.aaAddress = action.payload.aaAddress;
      if (action.payload.rallyAddress !== undefined) state.rallyAddress = action.payload.rallyAddress;
    },
    clearWalletInfo: (state) => {
      state.eoaAddress = null;
      state.aaAddress = null;
      state.rallyAddress = null;
      state.balance = '0';
    },
    updateAuthBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<any>) => { // Added loginSuccess reducer
      state.isLoggedIn = true;
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { loginSuccess, logout, setWalletInfo, clearWalletInfo, updateAuthBalance, setAuthenticated, setUser } = authSlice.actions; // Added loginSuccess, setAuthenticated, setUser to exports and removed signupFailure
export default authSlice.reducer;
