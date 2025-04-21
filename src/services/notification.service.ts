import { firebaseAdmin } from '~/configs/firebase.config'
import User from '~/database/models/user.model'
import { LocationRequestDto } from '~/dtos/location-request.dto'

// interface NotificationData {
//     [key: string]: string | number | boolean
// }

export class NotificationService {
    async sendNotification(userId: string, data: object) {
        const fcmToken = await this.getFCMToken(userId)
        // const fcmToken =
        //     'efi5SVUdSviTfVEU2OqiJY:APA91bHZuz9zLHWRpcNFlU7GRmyRoJNWaSVyXukX2q4ymJuWdMamRmdJZjnI0zo_dvyaiu2HlvIYHrjlfqJrP3Q5OiHG4_XyE9TPZ8LQYgkbFk2J-_m6m1Y'
        if (!fcmToken) {
            console.error('FCM token not found for user:', userId)
            return
        }

        console.log('FCM token:', fcmToken)
        const stringifiedData = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]))
        const message = {
            token: fcmToken,
            // notification: {
            //     title: payload.title,
            //     body: payload.body
            // },
            data: stringifiedData
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

    async handleAskLocation(data: LocationRequestDto): Promise<void> {
        const dataToSend = {
            type: 'ask_location',
            fromId: data.fromId,
            toId: data.toId
        }

        this.sendNotification(data.toId, dataToSend)
    }

    async getFCMToken(userId: string): Promise<string | null> {
        try {
            const user = await User.findOne({
                where: { id: userId },
                attributes: ['fcm_token']
            })
            if (!user) {
                console.error('User not found')
                return null
            }
            return user.getDataValue('fcm_token')
        } catch (error) {
            console.error('Error fetching device token:', error)
            throw error
        }
    }
}
