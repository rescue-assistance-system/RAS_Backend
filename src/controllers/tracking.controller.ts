import { Request, Response } from 'express'
import { TrackingService } from '../services/tracking.service'
import { createResponse } from '../utils/response.utils'

export class TrackingController {
    private trackingService: TrackingService

    constructor() {
        this.trackingService = new TrackingService()
    }

    public generateCode = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.user_id

            if (!userId) {
                return res.status(400).json(createResponse('error', null, 'User ID is required'))
            }

            const result = await this.trackingService.generateCode(userId)
            return res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error generating tracking code:', error)
            const errorMessage = error.message || 'Internal server error'
            if (errorMessage.includes('database')) {
                return res.status(500).json(createResponse('error', null, 'Database error occurred'))
            } else if (errorMessage.includes('network')) {
                return res.status(500).json(createResponse('error', null, 'Network error occurred'))
            } else {
                return res.status(500).json(createResponse('error', null, errorMessage))
            }
        }
    }
    public async getUserInfoByVerificationCode(req: Request, res: Response) {
        try {
            const { verification_code } = req.body
            const result = await this.trackingService.getUserInfoByVerificationCode(verification_code)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public acceptTracking = async (req: Request, res: Response) => {
        try {
            const { verification_code } = req.body
            const currentUserId = req.user?.user_id

            if (!verification_code) {
                return res.status(400).json(createResponse('error', null, 'Verification code is required'))
            }
            const result = await this.trackingService.acceptTracking(verification_code, currentUserId)
            return res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error accepting tracking request:', error)
            const errorMessage = error.message || 'Internal server error'

            // Custom handling
            const knownErrors = [
                'Failed to accept tracking request: Invalid or expired verification code',
                'Verification code is required'
            ]

            if (errorMessage === 'Failed to accept tracking request: Already being tracked') {
                return res.status(409).json(createResponse('error', null, errorMessage))
            }

            if (knownErrors.includes(errorMessage)) {
                return res.status(400).json(createResponse('error', null, errorMessage))
            }

            if (errorMessage.includes('database')) {
                return res.status(500).json(createResponse('error', null, 'Database error occurred'))
            } else if (errorMessage.includes('network')) {
                return res.status(500).json(createResponse('error', null, 'Network error occurred'))
            } else {
                return res.status(500).json(createResponse('error', null, errorMessage))
            }
        }
    }

    public getTrackers = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.user_id

            if (!userId) {
                return res.status(400).json(createResponse('error', null, 'User ID is required'))
            }

            const result = await this.trackingService.getTrackers(userId)
            return res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error getting trackers:', error)
            const errorMessage = error.message || 'Internal server error'
            if (errorMessage.includes('database')) {
                return res.status(500).json(createResponse('error', null, 'Database error occurred'))
            } else if (errorMessage.includes('network')) {
                return res.status(500).json(createResponse('error', null, 'Network error occurred'))
            } else {
                return res.status(500).json(createResponse('error', null, errorMessage))
            }
        }
    }

    // public cancelRequest = async (req: Request, res: Response) => {
    //     try {
    //         const result = await this.trackingService.cancelRequest(req.body.from_id, req.body.to_id)
    //         res.status(200).json(createResponse('success', result))
    //     } catch (error: any) {
    //         res.status(500).json(createResponse('error', null, error.message))
    //     }
    // }

    public cancelTracking = async (req: Request, res: Response) => {
        try {
            const { cancel_user_id } = req.body
            const currentUserId = req.user?.user_id

            if (!cancel_user_id) {
                return res.status(400).json(createResponse('error', null, 'Target user ID is required'))
            }

            if (!currentUserId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const result = await this.trackingService.cancelTracking(currentUserId, cancel_user_id)
            return res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error canceling tracking relationship:', error)
            const errorMessage = error.message || 'Internal server error'
            if (errorMessage.includes('database')) {
                return res.status(500).json(createResponse('error', null, 'Database error occurred'))
            } else if (errorMessage.includes('network')) {
                return res.status(500).json(createResponse('error', null, 'Network error occurred'))
            } else {
                return res.status(500).json(createResponse('error', null, errorMessage))
            }
        }
    }

    public blockUser = async (req: Request, res: Response) => {
        try {
            const currentUserId = req.user?.user_id
            const { blocked_user_id } = req.body

            if (!blocked_user_id) {
                return res.status(400).json(createResponse('error', null, 'Blocked user ID is required'))
            }

            if (!currentUserId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const result = await this.trackingService.blockUser(currentUserId, blocked_user_id)
            return res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error blocking user:', error)
            const errorMessage = error.message || 'Internal server error'
            if (errorMessage.includes('database')) {
                return res.status(500).json(createResponse('error', null, 'Database error occurred'))
            } else if (errorMessage.includes('network')) {
                return res.status(500).json(createResponse('error', null, 'Network error occurred'))
            } else {
                return res.status(500).json(createResponse('error', null, errorMessage))
            }
        }
    }

    public unblockUser = async (req: Request, res: Response) => {
        try {
            const currentUserId = req.user?.user_id
            const { blocked_user_id } = req.body

            if (!blocked_user_id) {
                return res.status(400).json(createResponse('error', null, 'Blocked user ID is required'))
            }

            if (!currentUserId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const result = await this.trackingService.unblockUser(currentUserId, blocked_user_id)
            return res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error unblocking user:', error)
            const errorMessage = error.message || 'Internal server error'
            if (errorMessage.includes('database')) {
                return res.status(500).json(createResponse('error', null, 'Database error occurred'))
            } else if (errorMessage.includes('network')) {
                return res.status(500).json(createResponse('error', null, 'Network error occurred'))
            } else {
                return res.status(500).json(createResponse('error', null, errorMessage))
            }
        }
    }
}
