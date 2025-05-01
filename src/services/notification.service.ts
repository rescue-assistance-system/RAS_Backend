import { firebaseAdmin } from '~/configs/firebase.config'
import User from '~/database/models/user.model'
import { LocationRequestDto } from '~/dtos/location-request.dto'
import { SosResponseDto } from '~/dtos/sos-request.dto'

export class NotificationService {
    async handleSosRequest(data: SosResponseDto): Promise<void> {
        const dataToSend = {
            type: 'sos_request',
            userId: data.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address
        }

        await this.sendNotification(data.teamId, dataToSend)
    }

    async handleAskLocation(data: LocationRequestDto): Promise<void> {
        const dataToSend = {
            type: 'ask_location',
            fromId: data.fromId,
            toId: data.toId
        }

        await this.sendNotification(data.toId, dataToSend)
    }

    async sendNotification(userId: string, data: object) {
        const fcmToken = await this.getFCMToken(userId)
        if (!fcmToken) {
            console.error('FCM token not found for user:', userId)
            return
        }

        console.log('FCM token:', fcmToken)
        const stringifiedData = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]))
        const message = {
            token: fcmToken,
            data: stringifiedData
        }

        try {
            const response = await firebaseAdmin.messaging().send(message)
            console.log(`Successfully sent ${data['type'] === 'sos_request' ? 'SOS ' : ''}message:`, response)
            return response
        } catch (error) {
            console.error('Error sending message:', error)
            throw error
        }
    }

    async getFCMToken(userId: string): Promise<string | null> {
        try {
            const user = await User.findOne({
                where: { id: userId },
                attributes: ['fcm_token']
            })
            if (!user) {
                console.error('User not found for ID:', userId)
                return null
            }
            return user.getDataValue('fcm_token')
        } catch (error) {
            console.error('Error fetching FCM token:', error)
            throw error
        }
    }
}
