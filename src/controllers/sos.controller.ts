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
            res.status(200).json(createResponse('success', null, 'Case marked as Safe successfully'))
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

    public async cancelCaseByRescueTeam(req: Request, res: Response) {
        try {
            const teamId = req.user?.user_id
            const { caseId, reason } = req.body
            if (!teamId || !caseId) {
                return res
                    .status(400)
                    .json(createResponse('error', null, 'Team ID and Case ID are required in Access Token'))
            }

            await this.sosService.cancelCaseByRescueTeam(teamId, caseId, reason)
            res.status(200).json(createResponse('success', null, 'SOS request cancelled successfully'))
        } catch (error: any) {
            console.error('Error cancelling SOS request:', error)
            res.status(500).json(createResponse('error', null, 'Failed to cancel SOS request'))
        }
    }

    public async completedCase(req: Request, res: Response) {
        try {
            const teamId = req.user?.user_id
            const { caseId, description } = req.body
            if (!teamId || !caseId) {
                return res
                    .status(400)
                    .json(createResponse('error', null, 'Team ID and Case ID are required in Access Token'))
            }

            await this.sosService.completedCase(teamId, caseId, description)
            res.status(200).json(createResponse('success', null, 'SOS request completed successfully'))
        } catch (error: any) {
            console.error('Error completing SOS request:', error)
            res.status(500).json(createResponse('error', null, 'Failed to complete SOS request'))
        }
    }

    public async assignRescueTeam(req: Request, res: Response): Promise<void> {
        try {
            const { caseId, teamId } = req.body
            const coordinatorId = req.user?.user_id // Lấy ID của Coordinator từ token (middleware)
            console.log('Request body:', req.body)
            console.log('Coordinator ID:', coordinatorId)
            if (!caseId || !teamId) {
                res.status(400).json({ message: 'caseId and teamId are required.' })
                return
            }

            await this.sosService.assignTeamToCase(teamId, caseId, coordinatorId)

            res.status(200).json({ message: `Case ${caseId} has been assigned to team ${teamId}.` })
        } catch (error: any) {
            console.error('Error assigning rescue team:', error)
            res.status(500).json({ message: error.message })
        }
    }

    public async getAllSosRequestsForTeam(req: Request, res: Response) {
        try {
            const teamId = req.user?.user_id
            if (!teamId) {
                return res.status(400).json(createResponse('error', null, 'Team ID is required in Access Token'))
            }

            const sosRequests = await this.sosService.getAllSosRequestsForTeam(teamId)
            res.status(200).json(createResponse('success', sosRequests, 'SOS requests retrieved successfully'))
        } catch (error: any) {
            console.error('Error retrieving SOS requests:', error)
            res.status(500).json(createResponse('error', null, 'Failed to retrieve SOS requests'))
        }
    }

    public async getUserCases(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(400).json(createResponse('error', null, 'User ID is required in Access Token'))
            }

            const cases = await this.sosService.getUserCases(userId)
            res.status(200).json(createResponse('success', cases, 'User cases retrieved successfully'))
        } catch (error: any) {
            console.error('Error retrieving user cases:', error)
            res.status(500).json(createResponse('error', null, 'Failed to retrieve user cases'))
        }
    }
}
