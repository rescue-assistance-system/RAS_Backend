import { Router } from 'express'
import { TrackingController } from '../controllers/tracking.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const trackingController = new TrackingController()

router.use(authenticateToken)

/**
 * @swagger
 * tags:
 *   name: Tracking
 *   description: API for tracking management
 */

/**
 * @swagger
 * /generate_code:
 *   get:
 *     summary: Generate a tracking code
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully generated tracking code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Tracking request sent successfully"
 *                     verification_code:
 *                       type: string
 *                       example: "6Y0HVLG6"
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: string
 *                   example: "User ID is required"
 *       401:
 *         description: Access token is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access token is missing"
 *       500:
 *         description: >
 *           Internal server error. Possible reasons:
 *           - Database error occurred
 *           - Network error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/generate_code', trackingController.generateCode.bind(trackingController))

/**
 * @swagger
 * /get-user-info:
 *   post:
 *     summary: Get user information by verification code
 *     tags: [Tracking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verification_code:
 *                 type: string
 *                 description: Verification code to get user information
 *             required:
 *               - verification_code
 *           example:
 *             verification_code: "123456"
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully retrieved user information"
 *                 user_info:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 6
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *       400:
 *         description: Invalid request or verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired verification code"
 */
router.post('/get-user-info', trackingController.getUserInfoByVerificationCode.bind(trackingController))

/**
 * @swagger
 * /accept:
 *   post:
 *     summary: Accept a tracking request
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verification_code:
 *                 type: string
 *                 description: Verification code for accepting the tracking request
 *             required:
 *               - verification_code
 *           example:
 *             verification_code: "123456"
 *     responses:
 *       200:
 *         description: Successfully accepted tracking request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Tracking request accepted successfully"
 *                     tracking_data:
 *                       type: object
 *                       properties:
 *                         tracker_user_id:
 *                           type: integer
 *                           example: 6
 *                         target_user_id:
 *                           type: integer
 *                           example: 7
 *                         status:
 *                           type: string
 *                           example: "accepted"
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       500:
 *         description: Invalid or expired verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: "Failed to accept tracking request: Invalid or expired verification code"
 */
router.post('/accept', trackingController.acceptTracking.bind(trackingController))

/**
 * @swagger
 * /trackers:
 *   get:
 *     summary: Get all trackers
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved trackers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Successfully retrieved trackers"
 *                     trackers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             example: 6
 *                           username:
 *                             type: string
 *                             example: "Khoai"
 *                           email:
 *                             type: string
 *                             example: "lenguyen02312@gmail.com"
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: Access token is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access token is missing"
 */
router.get('/trackers', trackingController.getTrackers.bind(trackingController))

/**
 * @swagger
 * /cancel:
 *   delete:
 *     summary: Cancel a tracking request
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancel_user_id:
 *                 type: string
 *                 description: ID of the user whose tracking request is to be canceled
 *             required:
 *               - cancel_user_id
 *           example:
 *             cancel_user_id: "12345"
 *     responses:
 *       200:
 *         description: Successfully canceled tracking request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Target user ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: "Target user ID is required"
 *       500:
 *         description: No active tracking relationship found to cancel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: "Failed to cancel tracking: No active tracking relationship found to cancel"
 */
router.delete('/cancel', trackingController.cancelTracking.bind(trackingController))

/**
 * @swagger
 * /block:
 *   post:
 *     summary: Block a user
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blocked_user_id:
 *                 type: string
 *                 description: ID of the user to block
 *             required:
 *               - blocked_user_id
 *           example:
 *             blocked_user_id: "12345"
 *     responses:
 *       200:
 *         description: Successfully blocked user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User blocked successfully"
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Blocked user ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: string
 *                   example: "Blocked user ID is required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Failed to block user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: "Failed to block user: No active tracking relationship found to block"
 */
router.post('/block', trackingController.blockUser.bind(trackingController))

/**
 * @swagger
 * /unblock:
 *   post:
 *     summary: Unblock a user
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blocked_user_id:
 *                 type: string
 *                 description: ID of the user to unblock
 *             required:
 *               - blocked_user_id
 *           example:
 *             blocked_user_id: "12345"
 *     responses:
 *       200:
 *         description: Successfully unblocked user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User successfully unblocked"
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Blocked user ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: string
 *                   example: "Blocked user ID is required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: >
 *           Internal server error. Possible reasons:
 *           - Database error occurred
 *           - Network error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/unblock', trackingController.unblockUser.bind(trackingController))

export default router
