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
            console.log('Current authenticated user:', userId);

            if (!userId) {
                return res.status(400).json(createResponse('error', null, 'User ID is required'))
            }

            const result = await this.trackingService.generateCode(userId)
            return res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error generating tracking code:', error)
            return res.status(500).json(createResponse('error', null, error.message))
        }
    }

    public acceptTracking = async (req: Request, res: Response) => {
        try {
            const { verification_code } = req.body
            const currentUserId = req.user?.user_id

            if (!verification_code) {
                return res.status(400).json(createResponse('error', null, 'Verification code is required'))
            }

            console.log('Current authenticated user accepting tracking:', {
                user_id: currentUserId,
                device_id: req.user?.device_id,
                verification_code
            })

            const result = await this.trackingService.acceptTracking(verification_code, currentUserId)
            return res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error accepting tracking request:', error)
            return res.status(500).json(createResponse('error', null, error.message))
        }
    }

    public getTrackers = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.user_id

            if (!userId) {
                return res.status(400).json(createResponse('error', null, 'User ID is required'))
            }

            console.log('Current authenticated user:', {
                user_id: userId,
                device_id: req.user?.device_id
            })

            const result = await this.trackingService.getTrackers(userId)
            return res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error getting trackers:', error)
            return res.status(500).json(createResponse('error', null, error.message))
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

    // public cancelTracking = async (req: Request, res: Response) => {
    //     try {
    //         const result = await this.trackingService.cancelTracking(req.body.user_id, req.body.target_id)
    //         res.status(200).json(createResponse('success', result))
    //     } catch (error: any) {
    //         res.status(500).json(createResponse('error', null, error.message))
    //     }
    // }

    // public blockUser = async (req: Request, res: Response) => {
    //     try {
    //         const result = await this.trackingService.blockUser(req.body.blocker_id, req.body.blocked_id)
    //         res.status(200).json(createResponse('success', result))
    //     } catch (error: any) {
    //         res.status(500).json(createResponse('error', null, error.message))
    //     }
    // }

    // public unblockUser = async (req: Request, res: Response) => {
    //     try {
    //         const result = await this.trackingService.unblockUser(req.body.blocker_id, req.body.blocked_id)
    //         res.status(200).json(createResponse('success', result))
    //     } catch (error: any) {
    //         res.status(500).json(createResponse('error', null, error.message))
    //     }
    // }
}
