import { Request, Response } from 'express'
import { FirstAidGuideService } from '../services/first_aid_guide.service'
import { createResponse } from '../utils/response.utils'

export class FirstAidGuideController {
    private readonly firstAidGuideService: FirstAidGuideService

    constructor() {
        this.firstAidGuideService = new FirstAidGuideService()
    }

    public getAllFirstAidGuides = async (req: Request, res: Response) => {
        try {
            const result = await this.firstAidGuideService.getAllFirstAidGuides()
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public getFirstAidGuideById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.firstAidGuideService.getFirstAidGuideById(parseInt(id))
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public createFirstAidGuide = async (req: Request, res: Response) => {
        try {
            const result = await this.firstAidGuideService.createFirstAidGuide(req.body)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public updateFirstAidGuide = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.firstAidGuideService.updateFirstAidGuide(parseInt(id), req.body)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public deleteFirstAidGuide = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.firstAidGuideService.deleteFirstAidGuide(parseInt(id))
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }
}
