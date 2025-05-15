import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  currentStep: number;
  steps: {
    id: number;
    completed: boolean;
  }[];
}

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  currentStep: 0,
  steps: [
    { id: 1, completed: false }, // Welcome
    { id: 2, completed: false }, // Wallet Setup
    { id: 3, completed: false }, // Features Overview
  ],
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    completeStep: (state, action: PayloadAction<number>) => {
      const step = state.steps.find(s => s.id === action.payload);
      if (step) {
        step.completed = true;
      }
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
      state.steps.forEach(step => {
        step.completed = true;
      });
    },
    resetOnboarding: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentStep,
  completeStep,
  completeOnboarding,
  resetOnboarding,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
