import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

// Helper function to generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const authController = {
  // Register a new user
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, username } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
      },
    });

    // Create wallet for user
    await prisma.wallet.create({
      data: {
        userId: user.id,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    // Return user data without password
    const { password: _, ...userData } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token,
    });
  })
  }),

  // Login user
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data without password
    const { password: _, ...userData } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token,
    });
  }),

  // Get current user
  getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
    // User is already attached to req by auth middleware
    res.status(200).json({
      user: req.user,
    });
  }),

  // Verify email
  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    // In a real app, you would verify the token and update the user's email verification status
    // This is a simplified version

    res.status(200).json({
      message: 'Email verified successfully',
    });
  }),

  // Forgot password
  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Validate input
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({
        message: 'If your email is registered, you will receive a password reset link',
      });
    }

    // In a real app, you would generate a reset token and send an email
    // This is a simplified version

    res.status(200).json({
      message: 'If your email is registered, you will receive a password reset link',
    });
  }),

  // Reset password
  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      throw new ApiError(400, 'Token and password are required');
    }

    // In a real app, you would verify the token and update the user's password
    // This is a simplified version

    res.status(200).json({
      message: 'Password reset successfully',
    });
  }),

  // Change password
  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Current password and new password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new ApiError(404, 'User not found');
    }

    // Check current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: 'Password changed successfully',
    });
  }),

  // Logout
  logout: asyncHandler(async (req: Request, res: Response) => {
    // In a stateless JWT auth system, the client is responsible for removing the token
    // This endpoint is mostly for consistency and future extensions

    res.status(200).json({
      message: 'Logged out successfully',
    });
  }),

  // Google login
  googleLogin: asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;

    // Validate input
    if (!idToken) {
      throw new ApiError(400, 'ID token is required');
    }

    // In a real app, you would verify the token with Google and get user info
    // This is a simplified version
    const googleUserId = 'google_user_id'; // This would come from Google verification
    const email = 'google_user@example.com'; // This would come from Google verification

    // Check if user exists with this social login
    let user = await prisma.user.findFirst({
      where: {
        socialLogins: {
          some: {
            provider: 'google',
            providerId: googleUserId,
          },
        },
      },
    });

    // If not, check if user exists with this email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      // If user exists, link social login
      if (user) {
        await prisma.socialLogin.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerId: googleUserId,
            accessToken: idToken,
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            isEmailVerified: true, // Email is verified by Google
            socialLogins: {
              create: {
                provider: 'google',
                providerId: googleUserId,
                accessToken: idToken,
              },
            },
          },
        });

        // Create wallet for user
        await prisma.wallet.create({
          data: {
            userId: user.id,
          },
        });
      }
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Google login successful',
      user,
      token,
    });
  }),

  // Apple login
  appleLogin: asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;

    // Validate input
    if (!idToken) {
      throw new ApiError(400, 'ID token is required');
    }

    // In a real app, you would verify the token with Apple and get user info
    // This is a simplified version similar to Google login
    const appleUserId = 'apple_user_id'; // This would come from Apple verification
    const email = 'apple_user@example.com'; // This would come from Apple verification

    // Check if user exists with this social login
    let user = await prisma.user.findFirst({
      where: {
        socialLogins: {
          some: {
            provider: 'apple',
            providerId: appleUserId,
          },
        },
      },
    });

    // If not, check if user exists with this email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      // If user exists, link social login
      if (user) {
        await prisma.socialLogin.create({
          data: {
            userId: user.id,
            provider: 'apple',
            providerId: appleUserId,
            accessToken: idToken,
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            isEmailVerified: true, // Email is verified by Apple
            socialLogins: {
              create: {
                provider: 'apple',
                providerId: appleUserId,
                accessToken: idToken,
              },
            },
          },
        });

        // Create wallet for user
        await prisma.wallet.create({
          data: {
            userId: user.id,
          },
        });
      }
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Apple login successful',
      user,
      token,
    });
  }),

  // Thirdweb authentication
  thirdwebAuth: asyncHandler(async (req: Request, res: Response) => {
    const { email, strategy, walletAddress } = req.body;

    // Validate input
    if (!strategy || !walletAddress) {
      throw new ApiError(400, 'Strategy and wallet address are required');
    }

    // Check if user exists with this wallet address
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email || `${strategy}_${walletAddress.slice(0, 8)}@thryv.app`,
          walletAddress,
          isEmailVerified: strategy !== 'guest',
        },
      });

      // Create wallet for user
      await prisma.wallet.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data without password
    const { password: _, ...userData } = user;

    res.status(200).json({
      message: 'Authentication successful',
      user: userData,
      token,
    });
  }),
};
