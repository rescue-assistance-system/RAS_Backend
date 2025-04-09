import { v4 as uuidv4 } from 'uuid'
import redisClient from '../configs/redis.config'
import { Op } from 'sequelize'
import Tracking from '~/database/models/tracking.model'
export class TrackingService {
    public async generateCode(userId: string) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            const verificationCode =
                Math.random().toString(36).substring(2, 6).toUpperCase() +
                Math.random().toString(36).substring(2, 6).toUpperCase()

            const redisKey = `tracking_code:${userId}`
            const trackingData = {
                verification_code: verificationCode,
                generated_at: new Date().toISOString(),
                status: 'pending',
                user_id: userId
            }
            await redisClient.set(
                redisKey,
                JSON.stringify(trackingData),
                { EX: 30 * 60 } // 30 minutes expiration
            )

            return {
                message: 'Tracking request sent successfully',
                verification_code: verificationCode
            }
        } catch (error: any) {
            throw new Error(`Failed to generate tracking code: ${error.message}`)
        }
    }

    public async acceptTracking(verificationCode: string, currentUserId: string) {
        try {
            if (!verificationCode) {
                throw new Error('Verification code is required')
            }

            const keys = await redisClient.keys('tracking_code:*')
            let trackingData = null

            for (const key of keys) {
                const data = await redisClient.get(key)
                if (data) {
                    const parsedData = JSON.parse(data)
                    console.log('Checking tracking data:', parsedData)
                    if (parsedData.verification_code === verificationCode) {
                        trackingData = parsedData
                        console.log('Found matching tracking request:', trackingData)
                        break
                    }
                }
            }

            if (!trackingData) {
                throw new Error('Invalid or expired verification code')
            }

            if (trackingData.status !== 'pending') {
                throw new Error('This tracking request has already been processed')
            }

            if (currentUserId === trackingData.user_id) {
                throw new Error('A user cannot track themselves')
            }

            const existingTracking = await Tracking.findOne({
                where: {
                    tracker_user_id: trackingData.user_id,
                    target_user_id: currentUserId, 
                    status: 'accepted'
                }
            })

            if (existingTracking) {
                throw new Error('Already being tracked')
            }
            trackingData.status = 'accepted'
            // trackingData.accepted_at = new Date().toISOString()
            trackingData.tracker_user_id = trackingData.user_id
            trackingData.target_user_id = currentUserId

            const tracking = Tracking.build(trackingData)
            await tracking.save()
            console.log('Tracking data saved to database:', tracking)

            for (const key of keys) {
                await redisClient.del(key)
                console.log(`Deleted Redis key: ${key}`)
            }

            return {
                message: 'Tracking request accepted successfully',
                tracking_data: {
                    tracker_user_id: trackingData.tracker_user_id,
                    target_user_id: trackingData.target_user_id,
                    status: trackingData.status,
                    // accepted_at: trackingData.accepted_at
                }
            }
        } catch (error: any) {
            console.error('Error in acceptTracking:', error)
            throw new Error(`Failed to accept tracking request: ${error.message}`)
        }
    }

    public async getTrackers(userId: string) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            console.log('Getting trackers for user ID:', userId)


            const trackers = await Tracking.findAll({
                where: {
                    target_user_id: userId,
                    status: 'accepted'
                },
                attributes: ['tracker_user_id'],
                raw: true
            })
            console.log('Trackers from database:', trackers);
            const trackerList = trackers.map((tracker) => ({
                user_id: tracker.tracker_user_id
            }));


            return {
                message: 'Successfully retrieved trackers',
                trackers: trackerList,
            }
        } catch (error: any) {
            console.error('Error in getTrackers:', error)
            throw new Error(`Failed to get trackers: ${error.message}`)
        }
    }

    public async cancelRequest(fromId: number, toId: number) {
        return { message: 'Tracking request canceled' }
    }

    public async cancelTracking(userId: number, targetId: number) {
        return { message: 'Tracking canceled successfully' }
    }

    public async blockUser(blockerId: number, blockedId: number) {
        return { message: 'User blocked from tracking requests' }
    }

    public async unblockUser(blockerId: number, blockedId: number) {
        return { message: 'User unblocked from tracking requests' }
    }
}
