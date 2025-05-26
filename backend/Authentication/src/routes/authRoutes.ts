import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRegistration, validateLogin, validateOTP } from '../middleware/validationMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { ClerkController } from '../controllers/clerkController';

const router = Router();
const authController = new AuthController();
const clerkController = new ClerkController();

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/verify-otp', validateOTP, authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/refresh-token', authController.refreshToken);
router.post('/clerk/webhook', clerkController.handleWebhook)

// Protected routes
router.post('/logout', authMiddleware, authController.logout);

export { router as authRoutes };