import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/profile-image', userController.updateProfileImage);

// User settings routes
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);

// User notifications
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:id/read', userController.markNotificationAsRead);
router.put('/notifications/read-all', userController.markAllNotificationsAsRead);

// User streaks
router.get('/streaks', userController.getStreaks);

export default router;