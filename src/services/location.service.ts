import { User } from '~/database'
import { LocationRequestDto } from '~/dtos/location-request.dto'
import { SocketManager } from '~/sockets/SocketManager'
import { SocketService } from '~/sockets/SocketService'
import { NotificationService } from './notification.service'
import { LocationResponseDto } from '~/dtos/location-response.dto'
import { RedisManager } from '~/middleware/redis.middleware'

export class LocationService {
    public async updateLocation(userId: number, latitude: number, longitude: number) {
        try {
            // if (!userId || latitude === undefined || longitude === undefined) {
            //     throw new Error('User ID, latitude, and longitude are required')
            // }
            await User.update({ latitude, longitude }, { where: { id: userId } })

            console.log(`Location updated for user ${userId}: (${latitude}, ${longitude})`)
        } catch (error: any) {
            console.error('Error updating location:', error)
            throw new Error(`Failed to update location: ${error.message}`)
        }
    }

    public async sendLocationResponse(data: LocationResponseDto) {
        try {
            // Cache the location in redis
            await RedisManager.setLocationToRedis(data.fromId, data.latitude, data.longitude)
            console.log(`Location cached for user ${data.fromId}: (${data.latitude}, ${data.longitude})`)

            await SocketService.getInstance().handleLocationResponse(data)
        } catch (error: any) {
            throw new Error(`Failed to send location response: ${error.message}`)
        }
    }

    public async askUserLocation(data: LocationRequestDto): Promise<LocationResponseDto | null> {
        try {
            const cachedLocation = await RedisManager.getLocationFromRedis(data.toId)

            if (cachedLocation) {
                const timeDiff = new Date().getTime() - new Date(cachedLocation.timestamp).getTime()
                const timeLimit = 15 * 1000
                if (timeDiff < timeLimit) {
                    console.log(
                        `User ${data.toId} location is cached: (${cachedLocation.latitude}, ${cachedLocation.longitude})`
                    )

                    return {
                        fromId: data.toId,
                        toId: data.fromId,
                        latitude: cachedLocation.latitude,
                        longitude: cachedLocation.longitude
                    }
                } else {
                    console.log(`User ${data.toId} location is cached but expired`)
                }
            }

            console.log(`Asking user ${data.toId} for location from user ${data.fromId}`)

            const socketId = await SocketManager.getSocketId(data.toId)
            if (socketId) {
                console.log(`User ${data.toId} is online`)
                SocketService.getInstance().handleAskLocation(data)
            } else {
                console.log(`User ${data.toId} is offline, cannot ask for location`)
                new NotificationService().handleAskLocation(data)
            }
            // You can also store the request in the database or send a notification
            return null
        } catch (error: any) {
            console.error('Error asking for user location:', error)
            throw new Error(`Failed to ask for user location: ${error.message}`)
        }
    }
}
