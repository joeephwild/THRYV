import { createSlice, PayloadAction, nanoid, Action } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { RootState } from '../index'; // Adjust if your RootState is elsewhere
import { updateDailyStreak } from './userSlice'; // Import the action from userSlice

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon?: string; // e.g., name of an Ionicons icon
  deadline?: string; // ISO date string
  createdAt: string;
}

interface GoalsState {
  goals: Goal[];
}

const initialState: GoalsState = {
  goals: [
    // Mock initial data
    {
      id: nanoid(),
      name: 'Vacation to Bali',
      targetAmount: 2000,
      currentAmount: 750,
      icon: 'airplane-outline',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Approx 30 days from now
      createdAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      name: 'New Gaming Laptop',
      targetAmount: 1500,
      currentAmount: 300,
      icon: 'laptop-outline',
      // no deadline for this one initially
      createdAt: new Date().toISOString(),
    },
  ],
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    addGoal: {
      reducer: (state, action: PayloadAction<Goal>) => {
        state.goals.push(action.payload);
      },
      prepare: (goal: Omit<Goal, 'id' | 'currentAmount' | 'createdAt' | 'deadline'> & { deadline?: string }) => {
        const id = nanoid();
        const createdAt = new Date().toISOString();
        return { payload: { id, currentAmount: 0, createdAt, ...goal, deadline: goal.deadline || undefined } };
      },
    },
    depositToGoal: (
      state,
      action: PayloadAction<{ goalId: string; amount: number }>
    ) => {
      const goal = state.goals.find((g) => g.id === action.payload.goalId);
      if (goal) {
        goal.currentAmount += action.payload.amount;
        if (goal.currentAmount > goal.targetAmount) {
          goal.currentAmount = goal.targetAmount; // Cap at target amount
        }
      }
    },
    updateGoal: (state, action: PayloadAction<Partial<Goal> & { id: string }>) => {
      const index = state.goals.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = { ...state.goals[index], ...action.payload };
      }
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter((g) => g.id !== action.payload);
    },
  },
});

export const { addGoal, depositToGoal, updateGoal, deleteGoal } = goalsSlice.actions;

export const selectGoals = (state: RootState) => state.goals.goals;
export const selectGoalById = (state: RootState, goalId: string) => 
  state.goals.goals.find(goal => goal.id === goalId);

export default goalsSlice.reducer;

// Define a Thunk type if not already defined globally
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown, // Extra argument, typically not used
  Action<string> // Basic action type
>;

// Thunk action creator
export const depositToGoalAndUpdateStreak = (
  payload: { goalId: string; amount: number }
): AppThunk => async (dispatch) => {
  // Dispatch the original depositToGoal action
  dispatch(depositToGoal(payload));

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  // Dispatch updateDailyStreak action from userSlice
  dispatch(updateDailyStreak({ depositDate: currentDate }));
};
