import { Router, Request, Response } from 'express'
import notificationController from '../controllers/notification.controller'
import { authorize } from '../middleware/auth.middleware'

const router = Router()

// Register routes
router.post('/test-send', authorize('user'), (req: Request, res: Response) =>
    notificationController.testSendNotification(req, res)
)

export default router
