import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  profileImage: string | null;
  walletAddress: string | null;
  isLoggedIn: boolean;
  balance: string;
  xpPoints: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastDepositDate: string | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  profileImage: null,
  walletAddress: null,
  isLoggedIn: false,
  balance: '0',
  xpPoints: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastDepositDate: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return {
        ...state,
        ...action.payload,
        isLoggedIn: true
      };
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    addXpPoints: (state, action: PayloadAction<number>) => {
      state.xpPoints += action.payload;
      
      // Level up logic (simple example)
      // Each level requires 100 * current level XP points
      const xpNeededForNextLevel = 100 * state.level;
      if (state.xpPoints >= xpNeededForNextLevel) {
        state.level += 1;
        state.xpPoints -= xpNeededForNextLevel;
      }
    },
    updateDailyStreak: (state, action: PayloadAction<{ depositDate: string }>) => {
      const { depositDate } = action.payload; // Expected format: YYYY-MM-DD
      const today = new Date(depositDate + 'T00:00:00Z'); // Ensure consistent time for comparison

      if (!state.lastDepositDate) {
        // First deposit ever or first since tracking started
        state.streak = 1;
      } else {
        const lastDeposit = new Date(state.lastDepositDate + 'T00:00:00Z');
        
        // Calculate the difference in days
        const diffTime = today.getTime() - lastDeposit.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Deposit made on the consecutive day
          state.streak += 1;
        } else if (diffDays > 1) {
          // Day(s) missed, reset streak
          state.streak = 1;
        } else if (diffDays === 0) {
          // Deposit made on the same day, streak doesn't change
          // No action needed for streak itself, but lastDepositDate will be updated
        } else {
          // This case (depositDate < state.lastDepositDate) should ideally not happen
          // if dates are always current. Resetting streak for safety.
          state.streak = 1; 
        }
      }

      if (state.streak > state.longestStreak) {
        state.longestStreak = state.streak;
      }
      state.lastDepositDate = depositDate;
    },
    logout: () => {
      return initialState;
    }
  }
});

export const { 
  setUser, 
  updateBalance, 
  addXpPoints, 
  updateDailyStreak, 
  logout 
} = userSlice.actions;

export default userSlice.reducer;
