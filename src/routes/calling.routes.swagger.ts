import { Router } from 'express'
import { CallController } from '~/controllers/calling.controller'
import { authenticateToken } from '~/middleware/auth.middleware'

const router = Router()
const callController = new CallController()
router.use(authenticateToken)

/**
 * @swagger
 * tags:
 *   name: Call
 *   description: API for notifications related to calls
 */

/**
 * @swagger
 * /call-received:
 *   post:
 *     tags:
 *       - Call
 *     summary: Notify when a call is received
 *     description: Endpoint to handle incoming call notifications between users.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: string
 *                 description: ID of the caller (friend)
 *                 example: "1234567890"
 *               name:
 *                 type: string
 *                 description: Name of the caller
 *                 example: "John Doe"
 *               avatar:
 *                 type: string
 *                 description: URL of the caller's avatar
 *                 example: "https://example.com/avatar.jpg"
 *             required:
 *               - friendId
 *     responses:
 *       200:
 *         description: Call received successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Call received successfully"
 *       400:
 *         description: Bad Request (missing fields or user offline)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "User is offline"
 */
router.post('/call-received', callController.receivedCall.bind(callController))

export default router
