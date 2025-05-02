import { Router } from 'express'
import { SosController } from '~/controllers/sos.controller'
import { authenticateToken } from '~/middleware/auth.middleware'

const router = Router()
const sosController = new SosController()
router.use(authenticateToken)

/**
 * @swagger
 * /sos/send:
 *   post:
 *     summary: Send SOS request to rescue teams
 *     tags:
 *       - SOS
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
 *         description: SOS request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: success
 *                 data:
 *                   notifiedTeamIds: ["1", "2"]
 *                 error: null
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: User ID, latitude, and longitude are required
 *       500:
 *         description: Failed to send SOS request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Failed to send SOS request
 */
router.post('/send', sosController.sendSos.bind(sosController))

/**
 * @swagger
 * /sos/safe:
 *   post:
 *     summary: Mark the case as cancelled when the user is safe
 *     tags:
 *       - SOS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caseId
 *             properties:
 *               caseId:
 *                 type: number
 *                 example: 35
 *     responses:
 *       200:
 *         description: Case marked as cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: success
 *                 data: null
 *                 error: null
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Case ID is required
 *       500:
 *         description: Failed to mark case as cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Failed to mark case as cancelled
 */
router.post('/safe', sosController.markSafe.bind(sosController))

/**
 * @swagger
 * /sos/accept:
 *   post:
 *     summary: Rescue team accepts a case
 *     tags:
 *       - SOS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - caseId
 *             properties:
 *               teamId:
 *                 type: number
 *                 example: 123
 *               caseId:
 *                 type: number
 *                 example: 456
 *     responses:
 *       200:
 *         description: Case accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: success
 *                 data: null
 *                 error: null
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Team ID and Case ID are required
 *       500:
 *         description: Failed to accept case
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Failed to accept case
 */
router.post('/accept', sosController.acceptCase.bind(sosController))

/**
 * @swagger
 * /sos/reject:
 *   post:
 *     summary: Rescue team rejects a case
 *     tags:
 *       - SOS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - caseId
 *             properties:
 *               teamId:
 *                 type: number
 *                 example: 123
 *               caseId:
 *                 type: number
 *                 example: 456
 *     responses:
 *       200:
 *         description: Case rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: success
 *                 data: null
 *                 error: null
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Team ID and Case ID are required
 *       500:
 *         description: Failed to reject case
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Failed to reject case
 */
router.post('/reject', sosController.rejectCase.bind(sosController))

/**
 * @swagger
 * /sos/change-status:
 *   post:
 *     summary: Rescue team updates the status of a case
 *     tags:
 *       - SOS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - caseId
 *               - newStatus
 *             properties:
 *               teamId:
 *                 type: number
 *                 example: 123
 *               caseId:
 *                 type: number
 *                 example: 456
 *               newStatus:
 *                 type: string
 *                 enum: [ACCEPTED, IN_PROGRESS, READY, COMPLETED, CANCELLED]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Case status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: success
 *                 data: null
 *                 error: null
 *       400:
 *         description: Missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Invalid status value
 *       500:
 *         description: Failed to update case status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Failed to update case status
 */
router.post('/change-status', sosController.changeStatus.bind(sosController))

export default router
