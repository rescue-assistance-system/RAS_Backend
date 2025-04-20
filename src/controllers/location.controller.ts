import { Request, Response } from 'express'
import { handleApiError } from '~/middleware/ErrorHandler'
import { LocationService } from '~/services/location.service'
import { createResponse } from '~/utils/response.utils'

export class LocationController {
    private locationService: LocationService

    constructor() {
        this.locationService = new LocationService()
    }
    public async updateLocation(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            const latitude = req.body.latitude
            const longitude = req.body.longitude

            if (!userId || !latitude || !longitude) {
                return res
                    .status(400)
                    .json(createResponse('error', null, 'User ID, latitude, and longitude are required'))
            }
            await this.locationService.updateLocation(userId, latitude, longitude)
            res.status(200).json(createResponse('success', null, 'Location updated successfully'))
        } catch (error: any) {
            return handleApiError(res, error, 'Error processing location update:')
        }
    }

    public async askUserLocation(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id?.toString()
            const toUserId = req.body.toUserId?.toString()

            if (!userId || !toUserId) {
                return res.status(400).json(createResponse('error', null, 'User ID, toUserId are required'))
            }
            const respond = await this.locationService.askUserLocation({ fromId: userId, toId: toUserId })
            return res.status(200).json(createResponse('success', respond, null))
        } catch (error: any) {
            return handleApiError(res, error, 'Error processing ask location:')
        }
    }

    public async sendLocationResponse(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id?.toString()
            const toUserId = req.body.toUserId?.toString()
            const latitude = req.body.latitude
            const longitude = req.body.longitude

            if (!userId || !toUserId || !latitude || !longitude) {
                return res
                    .status(400)
                    .json(createResponse('error', null, 'User ID, toUserId, latitude, and longitude are required'))
            }
            await this.locationService.sendLocationResponse({ fromId: userId, toId: toUserId, latitude, longitude })
            res.status(200).json(createResponse('success', null, 'Send location response successfully.'))
        } catch (error: any) {
            return handleApiError(res, error, 'Error processing send location response:')
        }
    }
}
