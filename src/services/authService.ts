import { apiService } from './api';
import { inAppWallet, preAuthenticate } from 'thirdweb/wallets/in-app';
import { client } from '../config/thirdweb';

// Types for authentication
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  walletAddress?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface ThirdwebAuthCredentials {
  email?: string;
  verificationCode?: string;
  strategy: 'email' | 'google' | 'apple' | 'discord' | 'phone' | 'guest';
  walletAddress?: string;
}

class AuthService {
  private wallet = inAppWallet();

  // Traditional email/password registration
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', credentials);

      // Store token
      if (response.token) {
        await apiService.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Traditional email/password login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);

      // Store token
      if (response.token) {
        await apiService.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Thirdweb authentication - Email with verification
  async preAuthenticateEmail(email: string): Promise<void> {
    try {
      await preAuthenticate({
        client,
        strategy: 'email',
        email,
      });
    } catch (error) {
      console.error('Email pre-authentication error:', error);
      throw error;
    }
  }

  // Thirdweb authentication - Login with email and verification code
  async loginWithThirdwebEmail(email: string, verificationCode: string): Promise<AuthResponse> {
    try {
      // Connect to thirdweb wallet
   const wallet =   await this.wallet.connect({
        client,
        strategy: 'email',
        email,
        verificationCode,
      });

      // Get wallet address
      const walletAddress = wallet.address

      // Authenticate with our backend using the wallet address
      const response = await this.authenticateWithBackend({
        strategy: 'email',
        email,
        walletAddress,
      });

      return response;
    } catch (error) {
      console.error('Thirdweb email login error:', error);
      throw error;
    }
  }

  // Thirdweb authentication - Google login
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      // Connect to thirdweb wallet with Google
    const wallet =  await this.wallet.connect({
        client,
        strategy: 'google',
      });

      // Get wallet address
      const walletAddress = wallet.address;

      // Authenticate with our backend
      const response = await this.authenticateWithBackend({
        strategy: 'google',
        walletAddress,
      });

      return response;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Thirdweb authentication - Apple login
  async loginWithApple(): Promise<AuthResponse> {
    try {
      // Connect to thirdweb wallet with Apple
   const wallet =  await this.wallet.connect({
        client,
        strategy: 'apple',
      });

      // Get wallet address
      const walletAddress = wallet.address;

      // Authenticate with our backend
      const response = await this.authenticateWithBackend({
        strategy: 'apple',
        walletAddress,
      });

      return response;
    } catch (error) {
      console.error('Apple login error:', error);
      throw error;
    }
  }

  // Thirdweb authentication - Guest login
  async loginAsGuest(): Promise<AuthResponse> {
    try {
      // Connect to thirdweb wallet as guest
   const wallet =  await this.wallet.connect({
        client,
        strategy: 'guest',
      });

      // Get wallet address
      const walletAddress = wallet.address;

      // Authenticate with our backend
      const response = await this.authenticateWithBackend({
        strategy: 'guest',
        walletAddress,
      });

      return response;
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    }
  }

  // Authenticate with backend using thirdweb credentials
  private async authenticateWithBackend(credentials: ThirdwebAuthCredentials): Promise<AuthResponse> {
    try {
      // Check if we need to create a new backend route for thirdweb auth
      // For now, we'll use a generic route that handles wallet-based authentication
      const response = await apiService.post<AuthResponse>('/auth/thirdweb', credentials);

      // Store token
      if (response.token) {
        await apiService.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Backend authentication error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      return await apiService.get<User>('/auth/me', true);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Disconnect thirdweb wallet
      if (this.wallet.isConnected()) {
        await this.wallet.disconnect();
      }

      // Clear tokens
      await apiService.clearToken();

      // Optional: Call backend logout endpoint
      await apiService.post('/auth/logout', {}, true);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens even if backend call fails
      await apiService.clearToken();
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await apiService.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Get connected wallet
  getWallet() {
    return this.wallet;
  }

  // Get wallet address
  getWalletAddress(): string | null {
    try {
      return this.wallet.getAddress();
    } catch (error) {
      return null;
    }
  }

  // Social login methods
  async loginWithFacebook(): Promise<AuthResponse> {
    // Implementation for Facebook login
    throw new Error('Facebook login not implemented yet');
  }

  async loginWithDiscord(): Promise<AuthResponse> {
    try {
      await this.wallet.connect({
        client,
        strategy: 'discord',
      });

      const walletAddress = this.wallet.getAddress();

      const response = await this.authenticateWithBackend({
        strategy: 'discord',
        walletAddress,
      });

      return response;
    } catch (error) {
      console.error('Discord login error:', error);
      throw error;
    }
  }

  // Phone authentication
  async loginWithPhone(phone: string, verificationCode: string): Promise<AuthResponse> {
    try {
      await this.wallet.connect({
        client,
        strategy: 'phone',
        phoneNumber: phone,
        verificationCode,
      });

      const walletAddress = this.wallet.getAddress();

      const response = await this.authenticateWithBackend({
        strategy: 'phone',
        walletAddress,
      });

      return response;
    } catch (error) {
      console.error('Phone login error:', error);
      throw error;
    }
  }

  // Pre-authenticate phone
  async preAuthenticatePhone(phone: string): Promise<void> {
    try {
      await preAuthenticate({
        client,
        strategy: 'phone',
        phoneNumber: phone,
      });
    } catch (error) {
      console.error('Phone pre-authentication error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
