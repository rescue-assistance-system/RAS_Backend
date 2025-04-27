import { Router } from 'express'
import rescueTeamController from '../../controllers/adminController/rescue_team.controller'
import { authorize } from '../../middleware/auth.middleware'

const router = Router()

// Profile management routes
router.post('/profile', authorize(['admin', 'rescue_team']), rescueTeamController.createProfile)
router.get('/profile', authorize(['admin', 'rescue_team']), rescueTeamController.getProfile)
router.put('/profile', authorize(['rescue_team', 'admin']), rescueTeamController.updateProfile)

// Team information routes
router.put('/profile/team-info', authorize(['rescue_team', 'admin']), rescueTeamController.updateTeamInfo)
router.put('/profile/members', authorize(['rescue_team', 'admin']), rescueTeamController.updateTeamMembers)
router.put('/profile/default-location', authorize(['rescue_team', 'admin']), rescueTeamController.updateDefaultLocation)

// Location tracking routes
router.put('/profile/current-location', authorize(['rescue_team', 'admin']), rescueTeamController.updateCurrentLocation)
router.get('/profile/location-history', authorize(['rescue_team', 'admin']), rescueTeamController.getLocationHistory)

// Full team information
router.get('/profile/full-info', authorize(['rescue_team', 'admin']), rescueTeamController.getFullTeamInfo)

export default router
