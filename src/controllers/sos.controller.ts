import { Request, Response } from 'express'
import { handleApiError } from '~/middleware/ErrorHandler'
import { SosService } from '~/services/sos.service'
import { createResponse } from '~/utils/response.utils'
import { SosRequestDto } from '~/dtos/sos-request.dto'

export class SosController {
    private sosService: SosService

    constructor() {
        this.sosService = new SosService()
    }

    public async sendSos(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id?.toString()
            const { latitude, longitude } = req.body
            console.log('Request body:', req.body)
            console.log('User ID:', userId)
            if (!userId || !latitude || !longitude) {
                return res
                    .status(400)
                    .json(createResponse('error', null, 'User ID, latitude, and longitude are required'))
            }

            const notifiedTeamIds = await this.sosService.sendSosRequest({
                userId,
                latitude,
                longitude
            })
            res.status(200).json(createResponse('success', { notifiedTeamIds }, 'SOS request sent successfully'))
        } catch (error: any) {
            return handleApiError(res, error, 'Error processing SOS request:')
        }
    }
}
