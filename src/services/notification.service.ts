import { firebaseAdmin } from '~/configs/firebase.config'

interface NotificationData {
    [key: string]: string | number | boolean
}

export class NotificationService {
    async sendNotification(deviceToken: string, payload: { title: string; body: string; data?: NotificationData }) {
        const message = {
            token: deviceToken,
            notification: {
                title: payload.title,
                body: payload.body
            },
            data: Object.fromEntries(Object.entries(payload.data || {}).map(([key, value]) => [key, value.toString()]))
        }

        try {
            const response = await firebaseAdmin.messaging().send(message)
            console.log('Successfully sent message:', response)
            return response
        } catch (error) {
            console.error('Error sending message:', error)
            throw error
        }
    }
}
