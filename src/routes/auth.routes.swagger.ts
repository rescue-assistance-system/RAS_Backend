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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization APIs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user
 *                 example: Nguyen Thi Lien Hoa
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: user1@example.com
 *               password:
 *                 type: string
 *                 description: Password of the user
 *                 example: password123
 *               device_id:
 *                 type: string
 *                 description: Device ID of the user
 *                 example: abc1
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: Nguyen Thi Lien Hoa
 *                     email:
 *                       type: string
 *                       example: user1@example.com
 *                     device_id:
 *                       type: string
 *                       example: abc1
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: User with this email already exists
 */router.post('/register', validateRegister, authController.register)

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP for registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: user1@example.com
 *               otp:
 *                 type: string
 *                 description: OTP sent to the user's email
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: OTP verified successfully
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: Invalid or expired OTP
 */
router.post('/verify-otp', validateVerifyOTP, authController.verifyOTP)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: user1@example.com
 *               password:
 *                 type: string
 *                 description: Password of the user
 *                 example: password123
 *               device_id:
 *                 type: string
 *                 description: Device ID of the user
 *                 example: abc1
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refresh_token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Invalid credentials or device mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 */
router.post('/login', validateLogin, authController.login)

/**
 * @swagger
 * /auth/request-otp:
 *   post:
 *     summary: Request OTP for login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: user1@example.com
 *               device_id:
 *                 type: string
 *                 description: Device ID of the user
 *                 example: abc1
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: OTP sent successfully
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: User not found or device mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: User not found
 */
router.post('/request-otp', validateRequestOTP, authController.requestOTP)

/**
 * @swagger
 * /auth/verify-login-otp:
 *   post:
 *     summary: Verify OTP for login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: user1@example.com
 *               otp:
 *                 type: string
 *                 description: OTP sent to the user's email
 *                 example: 123456
 *               device_id:
 *                 type: string
 *                 description: Device ID of the user
 *                 example: abc1
 *     responses:
 *       200:
 *         description: Login verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refresh_token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: Invalid or expired OTP
 */router.post('/verify-login-otp', validateVerifyLoginOTP, authController.verifyLoginOTP)

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: user1@example.com
 *               device_id:
 *                 type: string
 *                 description: Device ID of the user
 *                 example: abc1
 *     responses:
 *       200:
 *         description: OTP sent for password reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: OTP sent for password reset
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: User not found or device mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: User not found
 */
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword)

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user
 *                 example: user1@example.com
 *               otp:
 *                 type: string
 *                 description: OTP sent to the user's email
 *                 example: 123456
 *               new_password:
 *                 type: string
 *                 description: New password for the user
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Password reset successfully
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: Invalid or expired OTP
 */router.post('/reset-password', validateResetPassword, authController.resetPassword)

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token of the user
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       400:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', validateRefreshToken, authController.refreshToken)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token of the user
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Invalid refresh token
 */
router.post('/logout', validateLogout, authController.logout)

/**
 * @swagger
 * /auth/debug-redis:
 *   get:
 *     summary: Debug Redis keys
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Redis debug completed
 *       500:
 *         description: Internal server error
 */
router.get('/debug-redis', authController.debugRedis)

export default router