import { Request, Response } from 'express'
import rescueTeamService from '../services/rescue_teams.service'
import { createResponse } from '../utils/response.utils'

class RescueTeamController {
    async createProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const profile = await rescueTeamService.createRescueTeamProfile(userId, req.body)
            return res.status(201).json(createResponse('success', profile))
        } catch (error: any) {
            return res.status(400).json(createResponse('error', null, error.message))
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const profile = await rescueTeamService.getRescueTeamProfile(userId)
            return res.status(200).json(createResponse('success', profile))
        } catch (error: any) {
            return res.status(404).json(createResponse('error', null, error.message))
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const profile = await rescueTeamService.updateRescueTeamProfile(userId, req.body)
            return res.status(200).json(createResponse('success', profile))
        } catch (error: any) {
            return res.status(400).json(createResponse('error', null, error.message))
        }
    }

    async updateTeamInfo(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const { team_name, description } = req.body
            const profile = await rescueTeamService.updateTeamInfo(userId, { team_name, description })
            return res.status(200).json(createResponse('success', profile))
        } catch (error: any) {
            return res.status(400).json(createResponse('error', null, error.message))
        }
    }

    async updateTeamMembers(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const { members } = req.body
            const profile = await rescueTeamService.updateTeamMembers(userId, members)
            return res.status(200).json(createResponse('success', profile))
        } catch (error: any) {
            return res.status(400).json(createResponse('error', null, error.message))
        }
    }

    async updateDefaultLocation(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const { default_latitude, default_longitude } = req.body
            const profile = await rescueTeamService.updateDefaultLocation(userId, {
                default_latitude,
                default_longitude
            })
            return res.status(200).json(createResponse('success', profile))
        } catch (error: any) {
            return res.status(400).json(createResponse('error', null, error.message))
        }
    }

    async updateCurrentLocation(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const { latitude, longitude } = req.body
            const user = await rescueTeamService.updateCurrentLocation(userId, {
                latitude,
                longitude
            })
            return res.status(200).json(createResponse('success', user))
        } catch (error: any) {
            return res.status(400).json(createResponse('error', null, error.message))
        }
    }

    async getLocationHistory(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const { startDate, endDate, limit } = req.query
            const history = await rescueTeamService.getLocationHistory(userId, {
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined
            })
            return res.status(200).json(createResponse('success', history))
        } catch (error: any) {
            return res.status(400).json(createResponse('error', null, error.message))
        }
    }

    async getFullTeamInfo(req: Request, res: Response) {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(401).json(createResponse('error', null, 'Unauthorized'))
            }

            const teamInfo = await rescueTeamService.getFullTeamInfo(userId)
            return res.status(200).json(createResponse('success', teamInfo))
        } catch (error: any) {
            return res.status(404).json(createResponse('error', null, error.message))
        }
    }

    public getRescueTeamMembers = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.user_id?.toString()
            console.log('User ID:', userId)
            if (!userId) {
                res.status(400).json({ success: false, message: 'User ID is required' })
                return
            }

            const members = await rescueTeamService.getRescueTeamMembers(userId)
            res.status(200).json({ success: true, data: members })
        } catch (error: any) {
            console.error('Error in getRescueTeamMembers:', error)
            res.status(500).json({ success: false, message: error.message })
        }
    }
}

export default new RescueTeamController()
