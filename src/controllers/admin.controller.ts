import { Request, Response } from 'express'
import coordinatorService from '../services/coordinator.service'
import rescue_teamService from '../services/rescue_teams.service'
import { getSearchString } from '~/helpers/pagination'
class AdminController {
    async createCoordinator(req: Request, res: Response) {
        try {
            const coordinator = await coordinatorService.createCoordinator(req.body)
            res.status(201).json({
                status: 'success',
                data: coordinator,
                error: null
            })
        } catch (error: any) {
            res.status(400).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }

    async getCoordinators(req: Request, res: Response) {
        try {
            const coordinators = await coordinatorService.getCoordinators()
            res.status(200).json({
                status: 'success',
                data: coordinators,
                error: null
            })
        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }

    async getCoordinatorById(req: Request, res: Response) {
        try {
            const coordinator = await coordinatorService.getCoordinatorById(Number(req.params.id))
            res.status(200).json({
                status: 'success',
                data: coordinator,
                error: null
            })
        } catch (error: any) {
            res.status(404).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }

    async updateCoordinator(req: Request, res: Response) {
        try {
            const coordinator = await coordinatorService.updateCoordinator(Number(req.params.id), req.body)
            res.status(200).json({
                status: 'success',
                data: coordinator,
                error: null
            })
        } catch (error: any) {
            res.status(404).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }

    async deleteCoordinator(req: Request, res: Response) {
        try {
            const result = await coordinatorService.deleteCoordinator(req.params.id)
            res.status(200).json({
                status: 'success',
                data: result,
                error: null
            })
        } catch (error: any) {
            res.status(404).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }

    async createRescueTeam(req: Request, res: Response) {
        try {
            const rescue_team = await rescue_teamService.createRescueTeam(req.body)
            res.status(201).json({
                status: 'success',
                data: rescue_team,
                error: null
            })
        } catch (error: any) {
            res.status(400).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }

    async getRescueTeams(req: Request, res: Response) {
        try {
            const rescue_team = await rescue_teamService.getRescueTeams()
            res.status(200).json({
                status: 'success',
                data: rescue_team,
                error: null
            })
        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }

    async getRescueTeamById(req: Request, res: Response) {
        try {
            const rescue_team = await rescue_teamService.getRescueTeamById(Number(req.params.id))
            res.status(200).json({
                status: 'success',
                data: rescue_team,
                error: null
            })
        } catch (error: any) {
            res.status(404).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }

    async updateRescueTeam(req: Request, res: Response) {
        try {
            const coordinator = await rescue_teamService.updateRescueTeam(Number(req.params.id), req.body)
            res.status(200).json({
                status: 'success',
                data: coordinator,
                error: null
            })
        } catch (error: any) {
            res.status(404).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }

    async deleteRescueTeam(req: Request, res: Response) {
        try {
            const result = await rescue_teamService.deleteRescueTeam(req.params.id)
            res.status(200).json({
                status: 'success',
                data: result,
                error: null
            })
        } catch (error: any) {
            res.status(404).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }
    async getRescueTeamProfileById(req: Request, res: Response) {
        try {
            // const rescueTeamId = req.params.id
            const rescue_team = await rescue_teamService.getRescueTeamProfileById(Number(req.params.id))
            res.status(200).json({
                status: 'success',
                data: rescue_team,
                error: null
            })
        } catch (error: any) {
            res.status(404).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }
    async getPaginatedRescueTeams(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query
            const searchString = getSearchString(search)
            const data = await rescue_teamService.getPaginatedRescueTeams(
                parseInt(page as string),
                Number(limit),
                searchString
            )

            res.status(200).json({
                status: 'success',
                data,
                error: null
            })
        } catch (error) {
            res.status(500).json({
                status: 'error',
                data: null,
                error: error.message
            })
        }
    }
}

export default new AdminController()
