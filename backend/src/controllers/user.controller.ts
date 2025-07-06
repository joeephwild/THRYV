import { Request, Response } from 'express';
import { prisma } from '../index';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

export const userController = {
  // Get user profile
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        phoneNumber: true,
        dateOfBirth: true,
        profileImage: true,
        walletAddress: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      user,
    });
  }),

  // Update user profile
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { firstName, lastName, username, phoneNumber, dateOfBirth } = req.body;

    // Check if username is already taken
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ApiError(409, 'Username is already taken');
      }
    }

    // Check if phone number is already taken
    if (phoneNumber) {
      const existingUser = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ApiError(409, 'Phone number is already registered');
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        username,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        phoneNumber: true,
        dateOfBirth: true,
        profileImage: true,
        walletAddress: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  }),

  // Update profile image
  updateProfileImage: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { profileImage } = req.body;

    if (!profileImage) {
      throw new ApiError(400, 'Profile image is required');
    }

    // In a real app, you would handle file upload and storage
    // This is a simplified version that just stores the image URL

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage,
      },
      select: {
        id: true,
        profileImage: true,
      },
    });

    res.status(200).json({
      message: 'Profile image updated successfully',
      profileImage: updatedUser.profileImage,
    });
  }),

  // Get user settings
  getSettings: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    // In a real app, you would have a settings table
    // This is a simplified version that returns user preferences

    res.status(200).json({
      settings: {
        notifications: true,
        darkMode: false,
        language: 'en',
        currency: 'USD',
      },
    });
  }),

  // Update user settings
  updateSettings: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { notifications, darkMode, language, currency } = req.body;

    // In a real app, you would update the settings in the database
    // This is a simplified version

    res.status(200).json({
      message: 'Settings updated successfully',
      settings: {
        notifications,
        darkMode,
        language,
        currency,
      },
    });
  }),

  // Get user notifications
  getNotifications: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      notifications,
    });
  }),

  // Mark notification as read
  markNotificationAsRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({
      message: 'Notification marked as read',
    });
  }),

  // Mark all notifications as read
  markAllNotificationsAsRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.status(200).json({
      message: 'All notifications marked as read',
    });
  }),

  // Get user streaks
  getStreaks: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const streaks = await prisma.streak.findMany({
      where: { userId },
    });

    res.status(200).json({
      streaks,
    });
  }),
};