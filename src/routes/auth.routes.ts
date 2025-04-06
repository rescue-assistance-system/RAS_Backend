import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import {
    validateRegister,
    validateVerifyOTP,
    validateLogin,
    validateVerifyLoginOTP,
    validateRequestOTP,
    validateForgotPassword,
    validateResetPassword,
    validateRefreshToken,
    validateLogout
} from '../middleware/validation.middleware'

const router = Router()
const authController = new AuthController()

// Registration routes
router.post('/register', validateRegister, authController.register)
router.post('/verify-otp', validateVerifyOTP, authController.verifyOTP)

// Login routes
router.post('/login', validateLogin, authController.login)
router.post('/request-otp', validateRequestOTP, authController.requestOTP)
router.post('/verify-login-otp', validateVerifyLoginOTP, authController.verifyLoginOTP)

// Password management routes
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword)
router.post('/reset-password', validateResetPassword, authController.resetPassword)

// Token management routes
router.post('/refresh-token', validateRefreshToken, authController.refreshToken)
router.post('/logout', validateLogout, authController.logout)

// Debug route
router.get('/debug-redis', authController.debugRedis)

export default router
