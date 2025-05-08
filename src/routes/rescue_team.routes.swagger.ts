import { Router } from 'express'
import rescueTeamController from '../controllers/rescue_team.controller'
import { authorize } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * /rescue-teams/profile:
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
 * /rescue-teams/profile:
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
 * /rescue-teams/profile:
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
 * /rescue-teams/profile/team-info:
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
router.put('/profile/team-info', rescueTeamController.updateTeamInfo)

router.put('/profile/members', rescueTeamController.updateTeamMembers)

router.put('/profile/default-location', rescueTeamController.updateDefaultLocation)

router.put('/profile/current-location', rescueTeamController.updateCurrentLocation)

router.get('/profile/location-history', rescueTeamController.getLocationHistory)

router.get('/profile/full-info', rescueTeamController.getFullTeamInfo)

/**
 * @swagger
 * /rescue-teams/members:
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

export default router
