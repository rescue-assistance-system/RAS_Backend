import { Op } from 'sequelize'
import { firebaseAdmin } from '~/configs/firebase.config'
import User from '~/database/models/user.model'
import { LocationRequestDto } from '~/dtos/location-request.dto'
import { MessageDTO } from '~/dtos/messageDTO'
import { SosMessageDto } from '~/dtos/sos-message.dto'
import { SosResponseDto } from '~/dtos/sos-request.dto'

export class NotificationService {
    async sendNotification(userIds: string[], data: object) {
        const fcmTokens = await this.getFCMTokens(userIds)
        console.log('FCM token:', fcmTokens)

        const stringifiedData = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]))
        for (const token of fcmTokens) {
            const message = {
                token,
                data: stringifiedData
            }

            try {
                const response = await firebaseAdmin.messaging().send(message)
                console.log('Successfully sent message to', token, ':', response)
            } catch (error) {
                console.error('Error sending message to', token, ':', error)
            }
        }
    }

    async handleSosRequest(data: SosResponseDto): Promise<void> {
        const dataToSend = {
            type: 'sos_request',
            userId: data.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address
        }

        await this.sendNotification([data.teamId], dataToSend)
    }

    async handleAskLocation(data: LocationRequestDto): Promise<void> {
        const dataToSend = {
            type: 'ask_location',
            fromId: data.fromId,
            toId: data.toId
        }

        this.sendNotification([data.toId], dataToSend)
    }

    async sendMessage(data: MessageDTO, toIds: string[]): Promise<void> {
        const dataToSend = {
            type: 'message',
            ...data
        }

        await this.sendNotification(toIds, dataToSend)
    }

    async getFCMTokens(userIds: string[]): Promise<string[]> {
        try {
            const users = await User.findAll({
                where: {
                    id: {
                        [Op.in]: userIds
                    }
                },
                attributes: ['fcm_token']
            })

            if (users.length === 0) {
                console.error('No users found')
                return []
            }

            return users
                .map((user) => user.dataValues.fcm_token)
                .filter((token) => token !== null && token !== undefined)
        } catch (error) {
            console.error('Error fetching device tokens:', error)
            throw error
        }
    }

    public async sendToOfflineUsers(
        userIds: string[],
        notification: { type: string; sosMesage: SosMessageDto }
    ): Promise<void> {
        const fcmTokens = await this.getFCMTokens(userIds)
        if (fcmTokens.length === 0) {
            console.log('No FCM tokens found for offline users.')
            return
        }

        const notificationData = {
            type: notification.type,
            sosMesage: JSON.stringify(notification.sosMesage) // Properly stringify the object
        }

        const stringifiedData = Object.fromEntries(
            Object.entries(notification).map(([key, value]) => [key, String(value)])
        )
        for (const token of fcmTokens) {
            const message = {
                token,
                data: notificationData
            }

            try {
                const response = await firebaseAdmin.messaging().send(message)
                console.log('Successfully sent message to', userIds, token, ':', response)
            } catch (error) {
                console.error('Error sending message to', token, ':', error)
            }
        }
    }
}
