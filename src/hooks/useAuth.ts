import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { loginSuccess, logout, setLoading, setError } from '../store/slices/authSlice';
import { authService, AuthResponse } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoggedIn, isLoading, error } = useSelector((state: RootState) => state.auth);

  // Email authentication with verification
  const loginWithEmail = async (email: string, verificationCode: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const response = await authService.loginWithThirdwebEmail(email, verificationCode);
      dispatch(loginSuccess(response.user));
      return response;
    } catch (error: any) {
      dispatch(setError(error.message || 'Login failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Send verification code
  const sendVerificationCode = async (email: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      await authService.preAuthenticateEmail(email);
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to send verification code'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Social login methods
  const loginWithGoogle = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const response = await authService.loginWithGoogle();
      dispatch(loginSuccess(response.user));
      return response;
    } catch (error: any) {
      dispatch(setError(error.message || 'Google login failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loginWithApple = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const response = await authService.loginWithApple();
      dispatch(loginSuccess(response.user));
      return response;
    } catch (error: any) {
      dispatch(setError(error.message || 'Apple login failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loginAsGuest = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      const response = await authService.loginAsGuest();
      dispatch(loginSuccess(response.user));
      return response;
    } catch (error: any) {
      dispatch(setError(error.message || 'Guest login failed'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Logout
  const handleLogout = async () => {
    dispatch(setLoading(true));
    
    try {
      await authService.logout();
      dispatch(logout());
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the local state
      dispatch(logout());
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Check authentication status
  const checkAuth = async () => {
    dispatch(setLoading(true));
    
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        dispatch(loginSuccess(user));
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      dispatch(logout());
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Get wallet address
  const getWalletAddress = () => {
    return authService.getWalletAddress();
  };

  return {
    // State
    user,
    isLoggedIn,
    isLoading,
    error,
    
    // Methods
    loginWithEmail,
    sendVerificationCode,
    loginWithGoogle,
    loginWithApple,
    loginAsGuest,
    handleLogout,
    checkAuth,
    getWalletAddress,
  };
};
