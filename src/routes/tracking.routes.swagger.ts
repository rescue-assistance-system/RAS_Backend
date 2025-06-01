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
 *                     verification_code:
 *                       type: string
 *                       example: "3DV6KMLX"
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
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
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
 *                     user_id:
 *                       type: integer
 *                       example: 7
 *                     username:
 *                       type: string
 *                       example: "Nguyen Thi Le"
 *                     email:
 *                       type: string
 *                       example: "dilystech23@gmail.com"
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
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
 *                     tracker_user_id:
 *                       type: integer
 *                       example: 7
 *                     target_user_id:
 *                       type: integer
 *                       example: 6
 *                     status:
 *                       type: string
 *                       example: "accepted"
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Bad request due to validation error
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
 *                   enum:
 *                     - "Verification code is required"
 *                     - "Failed to accept tracking request: Invalid or expired verification code"
 *       409:
 *         description: Conflict - User is already being tracked
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
 *                   example: "Failed to accept tracking request: Already being tracked"
 *       500:
 *         description: Internal server error
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
 *                   example: "Database error occurred"
 */
router.post('/accept', trackingController.acceptTracking.bind(trackingController))

/**
 * @swagger
 * /trackers:
 *   get:
 *     summary: Get list of trackers for current user
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of trackers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         example: 5
 *                       username:
 *                         type: string
 *                         example: "Le Tien Dat"
 *                       email:
 *                         type: string
 *                         example: "taedtech13@gmail.com"
 *                       tracking_status:
 *                         type: boolean
 *                         example: true
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
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

/**
 * @swagger
 * /tracking/get-list-following:
 *   get:
 *     summary: Get a user's following list
 *     tags: [Tracking]
 *     description: Fetches a list of users that the current user is following.
 *     responses:
 *       '200':
 *         description: A list of users the specified user is following
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Response status
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FollowingUserDto'
 *                   description: List of following users
 *                 error:
 *                   type: string
 *                   description: Error message, if any
 *                   example: null
 *             example:
 *                   status: success
 *                   data:
 *                     - user_id: 1
 *                       username: "john_doe"
 *                       latitude: 51.5074
 *                       longitude: -0.1278
 *                     - user_id: 2
 *                       username: "jane_doe"
 *                       latitude: 48.8566
 *                       longitude: 2.3522
 *                   error: null
 *       '400':
 *         description: Invalid User ID provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Response status
 *                   example: error
 *                 data:
 *                   type: object
 *                   description: Empty object when no data is returned
 *                   example: null
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: User ID is required
 * components:
 *   schemas:
 *     FollowingUserDto:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The ID of the user being followed
 *         username:
 *           type: string
 *           description: The username of the user being followed
 *         latitude:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Latitude of the user's location
 *         longitude:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Longitude of the user's location
 *       required:
 *         - user_id
 *         - username
 *         - latitude
 *         - longitude
 */
router.get('/get-list-following', trackingController.getYourFollowing.bind(trackingController))

export default router
