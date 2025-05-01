import { Router } from 'express'
import { MessagingController } from '~/controllers/messaging.controller'
import { authenticateToken } from '~/middleware/auth.middleware'

const router = Router()
const messagingController = new MessagingController()
router.use(authenticateToken)

/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: APIs for message operations
 */

/**
 * @swagger
 * /messages/send-message:
 *   post:
 *     summary: Send a message
 *     description: Sends a message to a specific case.
 *     tags:
 *       - Messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - contentType
 *               - caseId
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is the message content"
 *               contentType:
 *                 type: string
 *                 enum: [TEXT, IMAGE, VOICE, CALL]
 *                 example: TEXT
 *               caseId:
 *                 type: string
 *                 example: "case123"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/MessageDTO'
 *                 error:
 *                   type: string
 *                   example: null
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields"
 */
router.post('/send-message', messagingController.sendMessage.bind(messagingController))

export default router
