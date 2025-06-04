import { Router } from 'express'
import { AnalyticsController } from '../controllers/analytics.controller'

const router = Router()
const controller = new AnalyticsController()

router.get('/dashboard', controller.getDashboard.bind(controller))
router.get('/sos-stats', controller.getSosStats.bind(controller))
router.get('/location-data', controller.getLocationData.bind(controller))
router.get('/team-performance', controller.getTeamPerformance.bind(controller))
router.get('/case-report-stats', controller.getCaseReportStats.bind(controller))

export default router
