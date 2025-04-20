import redisClient from '~/configs/redis.config'
import { LocationRedisDto } from '~/dtos/location-redis.dto'

export class RedisManager {
    static async setSocketIdToRedis(userId: string, socketId: string) {
        try {
            await redisClient.set(`user_socket:${userId}`, socketId)
        } catch (error) {
            console.error('Error setting socket ID to Redis:', error)
        }
    }

    static async getSocketIdFromRedis(userId: string) {
        try {
            const socketId = await redisClient.get(`user_socket:${userId}`)
            return socketId
        } catch (error) {
            console.error('Error getting socket ID from Redis:', error)
            return null
        }
    }

    static async removeSocketIdFromRedis(userId: string) {
        try {
            await redisClient.del(`user_socket:${userId}`)
        } catch (error) {
            console.error('Error removing socket ID from Redis:', error)
        }
    }

    static async getAllSocketIds() {
        try {
            const keys = await redisClient.keys('user_socket:*')
            const socketIds = await Promise.all(keys.map((key) => redisClient.get(key)))
            return socketIds.filter((socketId) => socketId !== null)
        } catch (error) {
            console.error('Error getting all socket IDs from Redis:', error)
            return []
        }
    }

    static async setLocationToRedis(userId: string, latitude: number, longitude: number) {
        try {
            const currentTime = new Date().toISOString()
            const locationData = new LocationRedisDto(userId, latitude, longitude, currentTime)
            await redisClient.set(`user_location:${userId}`, JSON.stringify(locationData))
        } catch (error) {
            console.error('Error setting socket ID to Redis:', error)
        }
    }

    static async getLocationFromRedis(userId: string): Promise<LocationRedisDto | null> {
        try {
            const locationData = await redisClient.get(`user_location:${userId}`)
            if (locationData) {
                return JSON.parse(locationData)
            }
            return null
        } catch (error) {
            console.error('Error getting socket ID from Redis:', error)
            return null
        }
    }
}
