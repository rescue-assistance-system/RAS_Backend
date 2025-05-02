import { Request, Response } from 'express'
import { handleApiError } from '~/middleware/ErrorHandler'
import { SosService } from '~/services/sos.service'
import { createResponse } from '~/utils/response.utils'
import { CaseStatus } from '../enums/case-status.enum'

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

    public async acceptCase(req: Request, res: Response) {
        try {
            const teamId = req.user?.user_id
            const { caseId } = req.body
            if (!teamId || !caseId) {
                return res
                    .status(400)
                    .json(createResponse('error', null, 'Team ID and Case ID are required in Access Token'))
            }

            await this.sosService.acceptCase(teamId, caseId)
            res.status(200).json(createResponse('success', null, 'SOS request accepted successfully'))
        } catch (error: any) {
            console.error('Error accepting SOS request:', error)
            res.status(500).json(createResponse('error', null, 'Failed to accept SOS request'))
        }
    }

    public async rejectCase(req: Request, res: Response) {
        try {
            const teamId = req.user?.user_id
            const { caseId } = req.body
            if (!teamId || !caseId) {
                return res
                    .status(400)
                    .json(createResponse('error', null, 'Team ID and Case ID are required in Access Token'))
            }

            await this.sosService.rejectCase(teamId, caseId)
            res.status(200).json(createResponse('success', null, 'SOS request rejected successfully'))
        } catch (error: any) {
            console.error('Error rejecting SOS request:', error)
            res.status(500).json(createResponse('error', null, 'Failed to reject SOS request'))
        }
    }

    public async changeStatus(req: Request, res: Response): Promise<void> {
        try {
            const teamId = req.user?.user_id
            console.log('Team ID:', teamId)
            const { caseId, newStatus } = req.body
            console.log('Request body:', req.body)

            if (!Object.values(CaseStatus).includes(newStatus)) {
                return res.status(400).json(createResponse('error', null, 'Invalid status value.'))
            }

            await this.sosService.changeStatus(teamId, caseId, newStatus)

            res.status(200).json(createResponse('success', null, `Case ${caseId} status updated to ${newStatus}.`))
        } catch (error: any) {
            console.error('Error in changeStatus endpoint:', error)

            // Trả về phản hồi lỗi
            res.status(500).json(createResponse('error', null, error.message || 'Failed to update case status.'))
        }
    }
}
