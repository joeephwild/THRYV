import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import onboardingReducer from './slices/onboardingSlice';
import walletReducer from './slices/walletSlice';
import userReducer from './slices/userSlice';
import goalsReducer from './slices/goalsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'onboarding', 'wallet', 'user', 'goals'], // Only persist these reducers
};

const rootReducer = combineReducers({
  auth: authReducer,
  onboarding: onboardingReducer,
  wallet: walletReducer,
  user: userReducer,
  goals: goalsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
