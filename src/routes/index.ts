import { Router } from 'express'
import authRoutes from './auth.routes.swagger'
// import notificationRoutes from './notification.routes'
import adminRoutes from './admin.routes.swagger'
// import coordinatorRoutes from './coordinator.routes.swagger';
import rescueTeamRoutes from './rescue_team.routes'
import trackingRoutes from './tracking.routes.swagger'
import newsCategoryRoutes from './news_category.routes'
import firstAidCategoryRoutes from './first_aid_category.routes'
import newsRoutes from './news.routes'
import locationRoutes from './location.routes.swagger'
import messageingRoutes from './messaging.routes.swagger'

const router = Router()

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
// router.use('/coordinator', coordinatorRoutes);
router.use('/rescue-team', rescueTeamRoutes)
router.use('/tracking', trackingRoutes)
router.use('/location', locationRoutes)
router.use('/messages', messageingRoutes)
// router.use('/notification', notificationRoutes)
router.use('/news-categories', newsCategoryRoutes)
router.use('/news', newsRoutes)
router.use('/first-aid-categories', firstAidCategoryRoutes)
export default router
