import { Router } from 'express'
import { SosController } from '~/controllers/sos.controller'
import { authenticateToken, authorizeCaseOwnership } from '~/middleware/auth.middleware'

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
router.post('/safe', authorizeCaseOwnership, sosController.markSafe.bind(sosController))

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
 *               - caseId
 *             properties:
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
 *                 error: Case ID is required
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
 *               - caseId
 *             properties:
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
 *                 error: Case ID is required
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
 *               - caseId
 *               - newStatus
 *             properties:
 *               caseId:
 *                 type: number
 *                 example: 456
 *               newStatus:
 *                 type: string
 *                 enum: [ACCEPTED, READY]
 *                 example: READY
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
 *       403:
 *         description: Cannot change status to COMPLETED or CANCELLED
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Cannot change status to COMPLETED or CANCELLED. Please use the dedicated API for completing or cancelling a case with a reason or description.
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

/**
 * @swagger
 * /sos/cancel:
 *   post:
 *     summary: Rescue team cancels a case
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
 *               - reason
 *             properties:
 *               caseId:
 *                 type: number
 *                 example: 456
 *               reason:
 *                 type: string
 *                 example: "The user is no longer in danger."
 *     responses:
 *       200:
 *         description: Case cancelled successfully
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
 *                 error: Case ID and reason are required
 *       403:
 *         description: Cannot cancel case due to invalid status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Cannot cancel case because it is not in ACCEPTED or READY status.
 *       500:
 *         description: Failed to cancel case
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Failed to cancel case
 */
router.post('/cancel', sosController.cancelCaseByRescueTeam.bind(sosController))

/**
 * @swagger
 * /sos/completed:
 *   post:
 *     summary: Rescue team completes a case
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
 *               - description
 *             properties:
 *               caseId:
 *                 type: number
 *                 example: 456
 *               description:
 *                 type: string
 *                 example: "The rescue operation was successfully completed."
 *     responses:
 *       200:
 *         description: Case completed successfully
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
 *                 error: Case ID and description are required
 *       500:
 *         description: Failed to complete case
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 data: null
 *                 error: Failed to complete case
 */
router.post('/completed', sosController.completedCase.bind(sosController))

/**
 * @swagger
 * /sos/assign:
 *   post:
 *     summary: Assign a rescue team to a cancelled case
 *     description: Allows a coordinator to assign a rescue team to a case that has been cancelled or requires reassignment.
 *     tags:
 *       - Coordinator
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caseId
 *               - teamId
 *             properties:
 *               caseId:
 *                 type: number
 *                 description: The ID of the case to assign a rescue team to.
 *                 example: 123
 *               teamId:
 *                 type: number
 *                 description: The ID of the rescue team to assign to the case.
 *                 example: 456
 *     responses:
 *       200:
 *         description: Rescue team assigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: success
 *                 message: "Case 123 has been assigned to team 456."
 *       400:
 *         description: Invalid input or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 message: "caseId and teamId are required."
 *       404:
 *         description: Case not found or not in CANCELLED status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 message: "Case with ID 123 not found or is not in CANCELLED status."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: error
 *                 message: "Failed to assign rescue team: <error details>"
 */
router.post('/assign', sosController.assignRescueTeam.bind(sosController));

export default router
