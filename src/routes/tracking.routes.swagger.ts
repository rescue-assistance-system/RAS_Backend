import { Router } from 'express'
import { TrackingController } from '../controllers/tracking.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const trackingController = new TrackingController()

router.use(authenticateToken)

// Các route liên quan đến tracking
router.get('/generate_code', trackingController.generateCode)
router.post('/accept', trackingController.acceptTracking)
router.get('/trackers', trackingController.getTrackers)

export default router