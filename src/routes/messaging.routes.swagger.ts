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
 *               - content_type
 *               - caseId
 *               - duration
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is the message content"
 *               content_type:
 *                 type: string
 *                 enum: [TEXT, IMAGE, VOICE, CALL]
 *                 example: TEXT
 *               caseId:
 *                 type: string
 *                 example: "case123"
 *              duration:
 *                type: integer
 *                example: 60
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

/**
 * @swagger
 * /messages/conversation:
 *   get:
 *     summary: Get conversation by case ID
 *     description: Retrieve paginated messages for a specific case based on the user's role.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: query
 *         name: caseId
 *         schema:
 *           type: integer
 *         required: true
 *         example: 123
 *         description: ID of the case to fetch messages for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         example: 10
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Conversation fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PagedMessages'
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
 *                   example: Missing required fields
 *       403:
 *         description: User does not have permission to access this conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User does not have permission to access this conversation
 */

/**
 * @swagger
 * /messages/user-conversations:
 *   get:
 *     summary: Get list of conversations by user
 *     description: Retrieve paginated list of conversations associated with a user.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         example: 10
 *         description: Number of conversations per page
 *     responses:
 *       200:
 *         description: List of user conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PagedConversations'
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
 *                   example: Missing required fields
 *       403:
 *         description: User does not have permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User does not have permission to access this conversation
 */
router.get('/user-conversations', messagingController.getListConversationsByUser.bind(messagingController))

/**
 * @swagger
 * /messages/rescue-conversations:
 *   get:
 *     summary: Get list of conversations by rescue team
 *     description: Retrieve paginated list of conversations for a rescue team member.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         example: 10
 *         description: Number of conversations per page
 *     responses:
 *       200:
 *         description: List of rescue team conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PagedConversations'
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
 *                   example: Missing required fields
 *       403:
 *         description: User does not have permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User does not have permission to access this conversation
 */
router.get('/rescue-conversations', messagingController.getListConversationsByRescueTeam.bind(messagingController))

/**
 * @swagger
 * components:
 *   schemas:
 *     MessageDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "msg_123456"
 *         caseId:
 *           type: string
 *           example: "case_789"
 *         content:
 *           type: string
 *           example: "Hello, this is a message."
 *         content_type:
 *           type: string
 *           example: "TEXT"
 *         senderId:
 *           type: string
 *           example: "user_abc"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-04-29T10:00:00Z"
 *
 *     PagedMessages:
 *       type: object
 *       properties:
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MessageDTO'
 *         totalItems:
 *           type: integer
 *           example: 100
 *         totalPages:
 *           type: integer
 *           example: 10
 *         currentPage:
 *           type: integer
 *           example: 1
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *
 *     PagedConversations:
 *       type: object
 *       properties:
 *         lastMessages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MessageDTO'
 *         totalItems:
 *           type: integer
 *           example: 100
 *         totalPages:
 *           type: integer
 *           example: 10
 *         currentPage:
 *           type: integer
 *           example: 1
 *         hasNextPage:
 *           type: boolean
 *           example: true
 */

router.get('/conversation', messagingController.getConversation.bind(messagingController))

export default router
