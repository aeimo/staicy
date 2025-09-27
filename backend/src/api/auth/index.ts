import { Router } from 'express';
import { authController } from './authController';
import { validateRequest } from '../../middleware/validation';
import { loginSchema, registerSchema, changePasswordSchema } from './authSchemas';

const router = Router();

// Authentication routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/change-password', validateRequest(changePasswordSchema), authController.changePassword);
router.get('/me', authController.getCurrentUser);
router.put('/profile', authController.updateProfile);

export { router as authRoutes };
