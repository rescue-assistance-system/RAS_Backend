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

export default router
