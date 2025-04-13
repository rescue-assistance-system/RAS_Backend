import redisClient from '../configs/redis.config'
import Tracking from '~/database/models/tracking.model'
import User from '~/database/models/user.model'
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

    public async getUserInfoByVerificationCode(verificationCode: string) {
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
                    if (parsedData.verification_code === verificationCode) {
                        trackingData = parsedData
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

            const user = await User.findByPk(trackingData.user_id)
            if (!user) {
                throw new Error('User not found')
            }

            return {
                message: 'Successfully retrieved user information',
                user_info: {
                    user_id: user.dataValues.id,
                    username: user.dataValues.username,
                    email: user.dataValues.email
                }
            }
        } catch (error: any) {
            console.error('Error in getUserInfoByVerificationCode:', error)
            throw new Error(`Failed to get user information: ${error.message}`)
        }
    }
    

    public async acceptTracking(verificationCode: string, currentUserId: string) {
        try {
            if (!verificationCode) {
                throw new Error('Verification code is required')
            }

            const keys = await redisClient.keys('tracking_code:*')
            let trackingData = null
            
            const user = await User.findByPk(trackingData.user_id)
            if (!user) {
                throw new Error('User not found')
            }

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
                    status: trackingData.status
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
                include: [
                    {
                        model: User,
                        as: 'tracker',
                        attributes: ['id', 'username', 'email'],
                        required: true
                    }
                ]
            })
            console.log('Trackers from database:', trackers)
            const trackerList = trackers.map((tracker) => ({
                user_id: tracker.tracker?.id,
                username: tracker.tracker?.username,
                email: tracker.tracker?.email
                // status: tracker.status,
            }))

            return {
                message: 'Successfully retrieved trackers',
                trackers: trackerList
            }
        } catch (error: any) {
            console.error('Error in getTrackers:', error)
            throw new Error(`Failed to get trackers: ${error.message}`)
        }
    }

    // public async cancelRequest(fromId: number, toId: number) {
    //     return { message: 'Tracking request canceled' }
    // }

    public async cancelTracking(userId: number, cancelId: number) {
        try {
            const tracking = await Tracking.findOne({
                where: {
                    tracker_user_id: userId,
                    target_user_id: cancelId,
                    status: 'accepted'
                }
            })

            if (!tracking) {
                throw new Error('No active tracking relationship found to cancel')
            }

            await tracking.destroy()
            return { message: 'Tracking canceled successfully' }
        } catch (error: any) {
            console.error('Error in cancelTracking:', error)
            throw new Error(`Failed to cancel tracking: ${error.message}`)
        }
    }

    public async blockUser(blockerId: number, blockedId: number) {
        try {
            const tracking = await Tracking.findOne({
                where: {
                    tracker_user_id: blockerId, // Người chặn
                    target_user_id: blockedId, // Người bị chặn
                    status: 'accepted' // Chỉ chặn nếu mối quan hệ đang ở trạng thái accepted
                }
            })

            if (!tracking) {
                throw new Error('No active tracking relationship found to block')
            }

            tracking.status = 'blocked'
            await tracking.save()

            return { message: 'User blocked successfully' }
        } catch (error: any) {
            console.error('Error in blockUser:', error)
            throw new Error(`Failed to block user: ${error.message}`)
        }
    }

    public async unblockUser(blockerId: number, blockedId: number) {
        try {
            const tracking = await Tracking.findOne({
                where: {
                    tracker_user_id: blockerId,
                    target_user_id: blockedId,
                    status: 'blocked'
                }
            })

            if (!tracking) {
                throw new Error('No blocked tracking relationship found to unblock')
            }

            tracking.status = 'accepted'
            await tracking.save()

            return { message: 'User unblocked successfully' }
        } catch (error: any) {
            console.error('Error in unblockUser:', error)
            throw new Error(`Failed to unblock user: ${error.message}`)
        }
    }

   
}
