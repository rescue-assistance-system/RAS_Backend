import { Router } from 'express'
import { LocationController } from '~/controllers/location.controller'
import { authenticateToken } from '~/middleware/auth.middleware'

const router = Router()
const locationController = new LocationController()
router.use(authenticateToken)

/**
 * @swagger
 * tags:
 *   name: Tracking
 *   description: API for tracking management
 */

/**
 * @swagger
 * /location/update-location:
 *   post:
 *     summary: Update current location of a user
 *     tags:
 *       - Location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 10.762622
 *               longitude:
 *                 type: number
 *                 example: 106.660172
 *     responses:
 *       200:
 *         description: Vị trí được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: success
 *                 data: null
 *                 error: null
 *       400:
 *         description: Thiếu thông tin user hoặc tọa độ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: User ID, latitude, and longitude are required
 */
router.post('/update-location', locationController.updateLocation.bind(locationController))

/**
 * @swagger
 * /location/ask-user-location:
 *   post:
 *     summary: Request another user to share their location
 *     tags:
 *       - Location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toUserId
 *             properties:
 *               toUserId:
 *                 type: number
 *                 description: The user ID of the person being asked for location
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Ask location request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 error:
 *                   type: string
 *                   example: User ID, toUserId are required
 */
router.post('/ask-user-location', locationController.askUserLocation.bind(locationController))

/**
 * @swagger
 * /location/send-location-response:
 *   post:
 *     summary: Request another user to share their location
 *     tags:
 *       - Location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toUserId
 *               - latitude
 *               - longitude
 *             properties:
 *               toUserId:
 *                 type: number
 *                 description: The user ID of the person being asked for location
 *                 example: 12345
 *               latitude:
 *                 type: number
 *                 description: The latitude of the person being asked for location
 *                 example: 10.23456
 *               longitude:
 *                 type: number
 *                 description: The longitude of the person being asked for location
 *                 example: 106.12345
 *     responses:
 *       200:
 *         description: Ask location request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/LocationResponseDto'
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 error:
 *                   type: string
 *                   example: User ID, toUserId are required
 */

router.post('/send-location-response', locationController.sendLocationResponse.bind(locationController))

/**
 * @swagger
 * components:
 *   schemas:
 *     LocationResponseDto:
 *       type: object
 *       properties:
 *         fromId:
 *           type: string
 *           example: "user123"
 *         toId:
 *           type: string
 *           example: "user456"
 *         latitude:
 *           type: number
 *           example: 10.762622
 *         longitude:
 *           type: number
 *           example: 106.660172
 */

export default router
