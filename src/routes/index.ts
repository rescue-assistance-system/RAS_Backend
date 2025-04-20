import { Router } from 'express'
import authRoutes from './auth.routes.swagger'
// import notificationRoutes from './notification.routes'
import adminRoutes from './admin.routes.swagger'
// import coordinatorRoutes from './coordinator.routes.swagger';
import rescueTeamRoutes from './rescue_team.routes'
import trackingRoutes from './tracking.routes.swagger'
import locationRoutes from './location.routes.swagger'

const router = Router()

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
// router.use('/coordinator', coordinatorRoutes);
router.use('/rescue-team', rescueTeamRoutes)
router.use('/tracking', trackingRoutes)
router.use('/location', locationRoutes)
// router.use('/notification', notificationRoutes)
export default router
