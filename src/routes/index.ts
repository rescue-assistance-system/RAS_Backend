import { Router } from 'express'
import authRoutes from './auth.routes.swagger'
// import notificationRoutes from './notification.routes'
import adminRoutes from './adminRoutes/admin.routes.swagger'
// import coordinatorRoutes from './coordinator.routes.swagger';
import rescueTeamRoutes from './sosRoutes/rescue_team.routes'
import trackingRoutes from './sosRoutes/tracking.routes.swagger'
import newsCategoryRoutes from './adminRoutes/news_category.routes'
import firstAidCategoryRoutes from './adminRoutes/first_aid_category.routes'
import firstAidGuideRoutes from './adminRoutes/first_aid_guide.routes'
import newsRoutes from './adminRoutes/news.routes'
import locationRoutes from './sosRoutes/location.routes.swagger'

const router = Router()

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
// router.use('/coordinator', coordinatorRoutes);
router.use('/rescue-team', rescueTeamRoutes)
router.use('/tracking', trackingRoutes)
router.use('/location', locationRoutes)
// router.use('/notification', notificationRoutes)
router.use('/news-categories', newsCategoryRoutes)
router.use('/news', newsRoutes)
router.use('/first-aid-categories', firstAidCategoryRoutes)
router.use('/first-aid-guides', firstAidGuideRoutes)
export default router
