import { Router } from 'express'
import authRoutes from './auth.routes.swagger'
// import notificationRoutes from './notification.routes'
import adminRoutes from './admin.routes.swagger'
// import coordinatorRoutes from './coordinator.routes.swagger';
import rescueTeamRoutes from './rescue_team.routes.swagger'
import trackingRoutes from './tracking.routes.swagger'
import newsCategoryRoutes from './news_category.routes.swagger'
import firstAidCategoryRoutes from './first_aid_category.routes.swagger'
import firstAidGuideRoutes from './first_aid_guide.routes.swagger'
import newsRoutes from './news.routes.swagger'
import locationRoutes from './location.routes.swagger'
import sosRoutes from './sos.routes.swagger'
import messageingRoutes from './messaging.routes.swagger'
import sosCoordinatorRoutes from './sos_coordinator.routes.swagger'
import cloudinaryRoutes from './cloudinary.routes.swagger'
import analyticsRoutes from './analytics.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
// router.use('/coordinator', coordinatorRoutes);
router.use('/rescue-team', rescueTeamRoutes)
router.use('/tracking', trackingRoutes)
router.use('/location', locationRoutes)
router.use('/sos', sosRoutes)
router.use('/sos-coordinator', sosCoordinatorRoutes)
router.use('/messages', messageingRoutes)
// router.use('/notification', notificationRoutes)
router.use('/news-categories', newsCategoryRoutes)
router.use('/news', newsRoutes)
router.use('/first-aid-categories', firstAidCategoryRoutes)
router.use('/first-aid-guides', firstAidGuideRoutes)
router.use('/cloudinary', cloudinaryRoutes)
router.use('/analytics', analyticsRoutes)

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running!'
    })
})
export default router
