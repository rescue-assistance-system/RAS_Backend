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
 *         description: Case marked as Safe successfully
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
 * /sos/requests/team:
 *   get:
 *     summary: Get all SOS requests grouped by case for a rescue team
 *     description: Lấy danh sách các SOS requests được nhóm theo case dành cho một rescue team cụ thể.
 *     tags:
 *       - SOS
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     parameters:
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của rescue team.
 *     responses:
 *       200:
 *         description: Danh sách các SOS requests được nhóm theo case.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID của case.
 *                           status:
 *                             type: string
 *                             description: Trạng thái của case.
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: Thời gian tạo case.
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID của user.
 *                           username:
 *                             type: string
 *                             description: Tên người dùng.
 *                           email:
 *                             type: string
 *                             description: Email của người dùng.
 *                       sosRequests:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: ID của SOS request.
 *                             user_id:
 *                               type: integer
 *                               description: ID của user gửi SOS.
 *                             latitude:
 *                               type: string
 *                               description: Vĩ độ của SOS request.
 *                             longitude:
 *                               type: string
 *                               description: Kinh độ của SOS request.
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               description: Thời gian tạo SOS request.
 *       400:
 *         description: Lỗi khi không tìm thấy teamId hoặc dữ liệu không hợp lệ.
 *       500:
 *         description: Lỗi server.
 */
router.get('/requests/team', sosController.getAllSosRequestsForTeam.bind(sosController))

/**
 * @swagger
 * /sos/user/cases:
 *   get:
 *     summary: Get all cases for a user
 *     description: Lấy danh sách tất cả các case mà một user đã tạo.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của user.
 *     responses:
 *       200:
 *         description: Danh sách các case của user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       case:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID của case.
 *                           status:
 *                             type: string
 *                             description: Trạng thái của case.
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: Thời gian tạo case.
 *                       sosRequests:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: ID của SOS request.
 *                             user_id:
 *                               type: integer
 *                               description: ID của user gửi SOS.
 *                             latitude:
 *                               type: string
 *                               description: Vĩ độ của SOS request.
 *                             longitude:
 *                               type: string
 *                               description: Kinh độ của SOS request.
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               description: Thời gian tạo SOS request.
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               description: Thời gian cập nhật SOS request.
 *                             nearest_team_ids:
 *                               type: array
 *                               items:
 *                                 type: integer
 *                               description: Danh sách ID của các rescue team gần nhất.
 *       400:
 *         description: Lỗi khi không tìm thấy userId hoặc dữ liệu không hợp lệ.
 *       500:
 *         description: Lỗi server.
 */
router.get('/user/cases', sosController.getUserCases.bind(sosController))


export default router
