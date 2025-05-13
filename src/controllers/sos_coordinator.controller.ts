import { Request, Response } from 'express'
import { CoordinatorSosService } from '~/services/sos_coordinator.service'
import { handleApiError } from '~/middleware/ErrorHandler'
import { createResponse } from '~/utils/response.utils'

export class SosCoordinatorController {
    private coordinatorSosService: CoordinatorSosService

    constructor() {
        this.coordinatorSosService = new CoordinatorSosService()
    }

    // Get all SOS requests for coordinator
    public getAllSosRequestsForCoordinator = async (req: Request, res: Response): Promise<void> => {
        try {
            const sosRequests = await this.coordinatorSosService.getAllSosRequestsForCoordinator()
            res.status(200).json(createResponse(sosRequests))
        } catch (error) {
            handleApiError(res, error)
        }
    }

    // Get detail SOS request by ID
    public getSosRequestById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { sosId } = req.params
            const sosRequest = await this.coordinatorSosService.getSosRequestById(Number(sosId))
            if (!sosRequest) {
                res.status(404).json(createResponse(null, 'SOS request not found', false))
                return
            }
            res.status(200).json(createResponse(sosRequest))
        } catch (error) {
            handleApiError(res, error)
        }
    }

    // Get available rescue teams
    public getAvailableRescueTeams = async (req: Request, res: Response): Promise<void> => {
        try {
            const availableTeams = await this.coordinatorSosService.getAvailableRescueTeams()
            res.status(200).json(createResponse(availableTeams))
        } catch (error) {
            handleApiError(res, error)
        }
    }

    // Get SOS statistics
    public getSosStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('Fetching SOS statistics...')
            const statistics = await this.coordinatorSosService.getSosStatistics()
            res.status(200).json(createResponse(statistics))
        } catch (error) {
            handleApiError(res, error)
        }
    }

    // Assign a rescue team to a case
    public assignTeamToCase = async (req: Request, res: Response): Promise<void> => {
        try {
            const coordinatorId = req.user?.user_id
            const { teamId, caseId } = req.body
            await this.coordinatorSosService.assignTeamToCase(Number(teamId), Number(caseId), Number(coordinatorId))
            res.status(200).json(createResponse(null, 'Team assigned to case successfully'))
        } catch (error) {
            handleApiError(res, error)
        }
    }

    // Notify rescue teams about a case update
    public notifyRescueTeamOfCase = async (req: Request, res: Response): Promise<void> => {
        try {
            const { caseId, message } = req.body
            await this.coordinatorSosService.notifyRescueTeamOfCase(Number(caseId), message)
            res.status(200).json(createResponse(null, 'Rescue teams notified successfully'))
        } catch (error) {
            handleApiError(res, error)
        }
    }

    public getRescueTeamLocations = async (req: Request, res: Response): Promise<void> => {
        try {
            const locations = await this.coordinatorSosService.getRescueTeamLocations()
            res.status(200).json({ success: true, data: locations })
        } catch (error: any) {
            console.error('Error in getRescueTeamLocations:', error)
            res.status(500).json({ success: false, message: error.message })
        }
    }
}
