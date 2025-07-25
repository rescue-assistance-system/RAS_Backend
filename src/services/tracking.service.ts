import redisClient from '../configs/redis.config'
import Tracking from '~/database/models/tracking.model'
import User from '~/database/models/user.model'
import { FollowingUserDto } from '~/dtos/following-user.dto'
import { generateTrackingCode } from '~/helpers/trackingCode'
export class TrackingService {
    public async generateCode(userId: number) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            const verificationCode = generateTrackingCode()

            // 🔍 Check if user exists
            const user = await User.findByPk(userId)
            if (!user) {
                throw new Error('User not found')
            }

            // ✅ Use update method
            await User.update({ tracking_code: verificationCode }, { where: { id: userId } })

            return {
                message: 'Tracking code generated and saved successfully',
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

            const user = await User.findOne({ where: { tracking_code: verificationCode, role: 'user' } })
            if (!user) {
                throw new Error('Invalid or expired verification code')
            }

            return {
                user_id: user.dataValues.id,
                username: user.dataValues.username,
                email: user.dataValues.email,
                role: user.dataValues.role
            }
        } catch (error: any) {
            console.error('Error in getUserInfoByVerificationCode:', error)
            throw new Error(`Failed to get user information: ${error.message}`)
        }
    }

    public async acceptTracking(verificationCode: string, currentUserId: number) {
        try {
            if (!verificationCode) {
                throw new Error('Verification code is required')
            }

            const user = await User.findOne({ raw: true, where: { tracking_code: verificationCode } })
            console.log('User found:', user)
            if (!user) {
                throw new Error('Invalid or expired verification code')
            }

            if (Number(currentUserId) === user.id) {
                throw new Error('A user cannot track themselves')
            }

            const existingTracking = await Tracking.findOne({
                where: {
                    tracker_user_id: user.id,
                    target_user_id: currentUserId,
                    status: 'accepted'
                }
            })

            if (existingTracking) {
                throw new Error('Already being tracked')
            }

            const newTracking = await Tracking.create({
                tracker_user_id: user.id,
                target_user_id: currentUserId,
                status: 'accepted'
            })

            return {
                tracker_user_id: newTracking.tracker_user_id,
                target_user_id: newTracking.target_user_id,
                status: newTracking.status
                // accepted_at: newTracking.accepted_at
            }
        } catch (error: any) {
            console.error('Error in acceptTracking:', error)
            throw new Error(`Failed to accept tracking request: ${error.message}`)
        }
    }

    public async getTrackers(userId: number) {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            console.log('Getting trackers for user ID:', userId)
            const trackers = await Tracking.findAll({
                where: {
                    target_user_id: userId
                    // status: 'accepted'
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

            const trackerList1 = trackers.map((tracker) => tracker.toJSON())
            const trackerList = trackerList1.map((tracker) => ({
                user_id: tracker.tracker.id,
                username: tracker.tracker.username,
                email: tracker.tracker.email,
                tracking_status: tracker.tracking_status
            }))
            return trackerList
        } catch (error: any) {
            console.error('Error in getTrackers:', error)
            throw new Error(`Failed to get trackers: ${error.message}`)
        }
    }

    public async getYourFollowing(userId: number): Promise<FollowingUserDto[]> {
        try {
            if (!userId) {
                throw new Error('User ID is required')
            }

            const following = await Tracking.findAll({
                where: {
                    tracker_user_id: userId,
                    status: 'accepted'
                },
                include: [
                    {
                        model: User,
                        as: 'target',
                        attributes: Object.keys(User.getAttributes()),
                        required: true
                    }
                ]
            })

            const followingList: FollowingUserDto[] = following.map((follow) => {
                const user = follow.get('target') as User
                const userJson = user?.toJSON?.() || {}
                return {
                    user_id: userJson.id,
                    username: userJson.username,
                    latitude: userJson.latitude ?? 0.0,
                    longitude: userJson.longitude ?? 0.0,
                    avatar: userJson.avatar ?? null,
                    tracking_status: Boolean(follow.get('tracking_status') ?? false)
                }
            })

            return followingList
        } catch (error: any) {
            console.error('Error in getYourFollowing:', error)
            throw new Error(`Failed to get your following list: ${error.message}`)
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
                    tracker_user_id: blockedId,
                    target_user_id: blockerId,
                    status: 'accepted'
                }
            })

            if (!tracking) {
                throw new Error('No active tracking relationship found to block')
            }

            tracking.status = 'blocked'
            tracking.tracking_status = false
            await tracking.update({ status: 'blocked', tracking_status: false })
            // await tracking.save()

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
                    tracker_user_id: blockedId,
                    target_user_id: blockerId,
                    status: 'blocked'
                }
            })

            if (!tracking) {
                throw new Error('No blocked tracking relationship found to unblock')
            }

            tracking.status = 'accepted'
            tracking.tracking_status = true
            await tracking.update({ status: 'accepted', tracking_status: true })
            // await tracking.save()

            return { message: 'User unblocked successfully' }
        } catch (error: any) {
            console.error('Error in unblockUser:', error)
            throw new Error(`Failed to unblock user: ${error.message}`)
        }
    }
}
