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
            const { latitude, longitude, address } = req.body
            console.log('Request body:', req.body)
            console.log('User ID:', userId)
            if (!userId || !latitude || !longitude || !address) {
                return res
                    .status(400)
                    .json(createResponse('error', null, 'User ID, latitude, longitude or address are required'))
            }

            const notifiedTeamIds = await this.sosService.sendSosRequest({
                userId,
                latitude,
                longitude,
                address
            })
            res.status(200).json(
                createResponse('success', { notifiedTeamIds, address }, 'SOS request sent successfully')
            )
        } catch (error: any) {
            return handleApiError(res, error, 'Error processing SOS request:')
        }
    }

    public async markSafe(req: Request, res: Response) {
        try {
            const { caseId } = req.body
            if (!caseId) {
                return res.status(400).json(createResponse('error', null, 'Case ID is required'))
            }

            await this.sosService.markSafe(caseId)
            res.status(200).json(createResponse('success', null, 'Case marked as cancelled successfully'))
        } catch (error: any) {
            console.error('Error marking case as cancelled:', error)
            res.status(500).json(createResponse('error', null, 'Failed to mark case as cancelled'))
        }
    }
}
