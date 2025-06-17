import { Router } from 'express'
import rescueTeamController from '../controllers/rescue_team.controller'
import { authorize } from '../middleware/auth.middleware'

const router = Router()
import { authenticateToken, authorize } from '~/middleware/auth.middleware'

// const router = Router()
// const controller = new SosCoordinatorController()

// router.use(authenticateToken)
/**
 * @swagger
 * /rescue-team/profile:
 *   post:
 *     summary: Create a rescue team profile
 *     tags:
 *       - Rescue Team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team_name:
 *                 type: string
 *                 description: Name of the rescue team
 *               team_members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *               default_latitude:
 *                 type: number
 *               default_longitude:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rescue team profile created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/profile', rescueTeamController.createProfile)

/**
 * @swagger
 * /rescue-team/profile:
 *   get:
 *     summary: Get the rescue team profile
 *     tags:
 *       - Rescue Team
 *     responses:
 *       200:
 *         description: Rescue team profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get('/profile', rescueTeamController.getProfile)

/**
 * @swagger
 * /rescue-team/profile:
 *   put:
 *     summary: Update the rescue team profile
 *     tags:
 *       - Rescue Team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team_name:
 *                 type: string
 *               team_members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *               default_latitude:
 *                 type: number
 *               default_longitude:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rescue team profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', rescueTeamController.updateProfile)

/**
 * @swagger
 * /rescue-team/profile/team-info:
 *   put:
 *     summary: Update the rescue team information
 *     tags:
 *       - Rescue Team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rescue team information updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/profile/team-info', authenticateToken, rescueTeamController.updateTeamInfo)

router.put('/profile/members', authenticateToken, rescueTeamController.updateTeamMembers)

router.put('/profile/default-location', authenticateToken, rescueTeamController.updateDefaultLocation)

router.put('/profile/current-location', authenticateToken, rescueTeamController.updateCurrentLocation)

router.get('/profile/location-history', rescueTeamController.getLocationHistory)

router.get('/profile/full-info', rescueTeamController.getFullTeamInfo)

/**
 * @swagger
 * /rescue-team/members:
 *   get:
 *     summary: Get members of the rescue team associated with the logged-in user
 *     tags:
 *       - Rescue Team
 *     responses:
 *       200:
 *         description: List of rescue team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the member
 *                   name:
 *                     type: string
 *                     description: Name of the member
 *                   role:
 *                     type: string
 *                     description: Role of the member in the team
 *                   contact:
 *                     type: string
 *                     description: Contact information of the member
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/members', rescueTeamController.getRescueTeamMembers)

/**
 * @swagger
 * /rescue-team/history/list-case:
 *   get:
 *     summary: Get all SOS requests grouped by case for a rescue team
 *     description: Lấy danh sách các SOS requests được nhóm theo case dành cho một rescue team cụ thể.
 *     tags:
 *       - Rescue Team
 *     security:
 *       - bearerAuth: [] # Requires authentication
 *     parameters:
 *       - in: query
 *         name: teamId
 *         required: true
 *         schema:
 *         type: integer
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
router.get('/history/list-case', rescueTeamController.getAllSosRequestsForTeam.bind(rescueTeamController))

/**
 * @swagger
 * /rescue-team/history/case/{caseId}:
 *   get:
 *     summary: Get detail of a specific case
 *     tags:
 *       - Rescue Team
 *     parameters:
 *       - name: caseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the case
 *     responses:
 *       200:
 *         description: Case detail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     case:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID of the case
 *                         status:
 *                           type: string
 *                           description: Status of the case
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: Time when the case was created
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID of the user
 *                         username:
 *                           type: string
 *                           description: Username of the user
 *                         email:
 *                           type: string
 *                           description: Email of the user
 *                     sosRequests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID of the SOS request
 *                           user_id:
 *                             type: integer
 *                             description: ID of the user who sent the SOS
 *                           latitude:
 *                             type: string
 *                             description: Latitude of the SOS request
 *                           longitude:
 *                             type: string
 *                             description: Longitude of the SOS request
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: Time when the SOS request was created
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             description: Time when the SOS request was last updated
 *                           nearest_team_ids:
 *                             type: array
 *                             items:
 *                               type: integer
 *                             description: List of nearest team IDs
 *       400:
 *         description: Bad request
 *       404:
 *         description: Case not found
 *       500:
 *         description: Internal server error
 */
router.get('/history/case/:caseId', rescueTeamController.getHistoryCaseDetails.bind(rescueTeamController))

router.get('/allRescueTeams', rescueTeamController.getAllRescueTeams.bind(rescueTeamController))
export default router
