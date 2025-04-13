import { NotificationService } from '../services/notification.service'
import { Request, Response } from 'express'

class NotificationController {
    private readonly notificationService: NotificationService

    constructor() {
        this.notificationService = new NotificationService()
    }

    public testSendNotification = async (req: Request, res: Response) => {
        const { deviceToken, title, body } = req.body

        try {
            const response = await this.notificationService.sendNotification(deviceToken, { title, body })
            res.status(200).json({ message: 'Notification sent', response })
        } catch (error) {
            res.status(500).json({ message: 'Failed to send notification', error })
        }
    }
}

export default new NotificationController()
