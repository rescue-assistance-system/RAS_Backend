import { Router } from 'express'
import { SosCoordinatorController } from '~/controllers/sos_coordinator.controller'
import { authenticateToken, authorize } from '~/middleware/auth.middleware'

const router = Router()
const controller = new SosCoordinatorController()

router.use(authenticateToken)

/**
 * @swagger
 * /coordinator/sos:
 *   get:
 *     summary: Get all SOS requests for the coordinator
 *     tags:
 *       - Coordinator SOS
 *     responses:
 *       200:
 *         description: List of SOS requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SosResponseDto'
 *       500:
 *         description: Internal server error
 */
router.get('/sos', authorize('coordinator'), controller.getAllSosRequestsForCoordinator.bind(controller))

/**
 * @swagger
 * /coordinator/sos/{sosId}:
 *   get:
 *     summary: Get details of a specific SOS request by ID
 *     tags:
 *       - Coordinator SOS
 *     parameters:
 *       - name: sosId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the SOS request
 *     responses:
 *       200:
 *         description: SOS request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SosResponseDto'
 *       404:
 *         description: SOS request not found
 *       500:
 *         description: Internal server error
 */
router.get('/sos/:sosId', authorize('coordinator'), controller.getSosRequestById.bind(controller))

/**
 * @swagger
 * /coordinator/rescue-teams/available:
 *   get:
 *     summary: Get all available rescue teams
 *     tags:
 *       - Coordinator SOS
 *     responses:
 *       200:
 *         description: List of available rescue teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the rescue team
 *                   name:
 *                     type: string
 *                     description: Name of the rescue team
 *                   status:
 *                     type: string
 *                     description: Status of the rescue team
 *                     example: available
 *                   default_latitude:
 *                     type: number
 *                     description: Default latitude of the rescue team
 *                   default_longitude:
 *                     type: number
 *                     description: Default longitude of the rescue team
 *       500:
 *         description: Internal server error
 */
router.get('/rescue-teams/available', authorize('coordinator'), controller.getAvailableRescueTeams.bind(controller))

/**
 * @swagger
 * /coordinator/statistics:
 *   get:
 *     summary: Get SOS statistics (total, pending, completed)
 *     tags:
 *       - Coordinator SOS
 *     responses:
 *       200:
 *         description: SOS statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 pending:
 *                   type: integer
 *                 completed:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/statistics', authorize('coordinator'), controller.getSosStatistics.bind(controller))

/**
 * @swagger
 * /coordinator/assign-team:
 *   post:
 *     summary: Assign a rescue team to a case
 *     tags:
 *       - Coordinator SOS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: integer
 *                 description: ID of the rescue team
 *               caseId:
 *                 type: integer
 *                 description: ID of the case
 *               coordinatorId:
 *                 type: integer
 *                 description: ID of the coordinator
 *     responses:
 *       200:
 *         description: Team assigned to case successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/assign-team', authorize('coordinator'), controller.assignTeamToCase.bind(controller))

/**
 * @swagger
 * /coordinator/notify-rescue-team:
 *   post:
 *     summary: Notify rescue team of Case about a case update
 *     tags:
 *       - Coordinator SOS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caseId:
 *                 type: integer
 *                 description: ID of the case
 *               message:
 *                 type: string
 *                 description: Notification message
 *     responses:
 *       200:
 *         description: Rescue teams notified successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/notify-rescue-team', authorize('coordinator'), controller.notifyRescueTeamOfCase.bind(controller))

/**
 * @swagger
 * /coordinator/rescue-teams/locations:
 *   get:
 *     summary: Get locations of all rescue teams
 *     tags:
 *       - Coordinator SOS
 *     responses:
 *       200:
 *         description: List of rescue team locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the rescue team
 *                   name:
 *                     type: string
 *                     description: Name of the rescue team
 *                   latitude:
 *                     type: number
 *                     description: Latitude of the rescue team's location
 *                   longitude:
 *                     type: number
 *                     description: Longitude of the rescue team's location
 *                   status:
 *                     type: string
 *                     description: Status of the rescue team
 *                     example: available
 *       500:
 *         description: Internal server error
 */
router.get('/rescue-teams/locations', authorize('coordinator'), controller.getRescueTeamLocations.bind(controller))

export default router
