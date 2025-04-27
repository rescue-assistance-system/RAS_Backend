import { Request, Response } from 'express'
import { FirstAidCategoryService } from '../../services/adminService/first_aid_category.service'
import { createResponse } from '../../utils/response.utils'

export class FirstAidCategoryController {
    private readonly firstAidCategoryService: FirstAidCategoryService

    constructor() {
        this.firstAidCategoryService = new FirstAidCategoryService()
    }

    public getAllFirstAidCategories = async (req: Request, res: Response) => {
        try {
            const result = await this.firstAidCategoryService.getAllFirstAidCategories()
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public getFirstAidCategoryById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.firstAidCategoryService.getFirstAidCategoryById(parseInt(id))
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public createFirstAidCategory = async (req: Request, res: Response) => {
        try {
            const result = await this.firstAidCategoryService.createFirstAidCategory(req.body)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public updateFirstAidCategory = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.firstAidCategoryService.updateFirstAidCategory(parseInt(id), req.body)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public deleteFirstAidCategory = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.firstAidCategoryService.deleteFirstAidCategory(parseInt(id))
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }
}
