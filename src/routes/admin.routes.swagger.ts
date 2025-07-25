import express from 'express'
import { authenticateToken, authorize } from '../middleware/auth.middleware'
import adminController from '../controllers/admin.controller'

const router = express.Router()

router.use(authenticateToken)
router.post('/coordinators', authorize(['admin']), adminController.createCoordinator)
router.get('/coordinators', authorize(['admin']), adminController.getCoordinators)
router.get('/coordinators/:id', authorize(['admin']), adminController.getCoordinatorById)
router.put('/coordinators/:id', authorize(['admin']), adminController.updateCoordinator)
router.delete('/coordinators/:id', authorize(['admin']), adminController.deleteCoordinator)

// router.get('/rescue-teams/paginated', authorize(['admin']), adminController.getPaginatedRescueTeams)
// router.get('/rescue-teams', authorize(['admin']), adminController.getRescueTeams)
// router.get('/rescue-teams/:id', authorize(['admin']), adminController.getRescueTeamById)
// router.get('/rescue-teams/:id/profile', authorize(['admin']), adminController.getRescueTeamProfileById)
// router.post('/rescue-teams', authorize(['admin']), adminController.createRescueTeam)
// router.put('/rescue-teams/:id', authorize(['admin']), adminController.updateRescueTeam)
// router.delete('/rescue-teams/:id', authorize(['admin']), adminController.deleteRescueTeam)

router.get('/rescue-teams/paginated', adminController.getPaginatedRescueTeams)
router.get('/rescue-teams', adminController.getRescueTeams)
router.get('/rescue-teams/:id', adminController.getRescueTeamById)
router.get('/rescue-teams/:id/profile', adminController.getRescueTeamProfileById)
router.post('/rescue-teams', adminController.createRescueTeam)
router.put('/rescue-teams/:id', adminController.updateRescueTeam)
router.delete('/rescue-teams/:id', adminController.deleteRescueTeam)

// router.post('/news', authorize('admin'), adminController.createNews);
// router.get('/news', authorize('admin'), adminController.getNews);
// router.get('/news/:id', authorize('admin'), adminController.getNewsById);
// router.put('/news/:id', authorize('admin'), adminController.updateNews);
// router.delete('/news/:id', authorize('admin'), adminController.deleteNews);

// router.post('/first-aid', authorize('admin'), adminController.createFirstAid);
// router.get('/first-aid', authorize('admin'), adminController.getFirstAid);
// router.get('/first-aid/:id', authorize('admin'), adminController.getFirstAidById);
// router.put('/first-aid/:id', authorize('admin'), adminController.updateFirstAid);
// router.delete('/first-aid/:id', authorize('admin'), adminController.deleteFirstAid);

// router.get('/statistics', authorize('admin'), adminController.getStatistics);
// router.get('/statistics/users', authorize('admin'), adminController.getUserStatistics);
// router.get('/statistics/activities', authorize('admin'), adminController.getActivityStatistics);

export default router
