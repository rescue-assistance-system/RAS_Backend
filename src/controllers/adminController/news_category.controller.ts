import { Request, Response } from 'express'
import { NewsCategoryService } from '../../services/adminService/news_category.service'
import { createResponse } from '../../utils/response.utils'

export class NewsCategoryController {
    private readonly newsCategoryService: NewsCategoryService

    constructor() {
        this.newsCategoryService = new NewsCategoryService()
    }

    public getAllNewsCategories = async (req: Request, res: Response) => {
        try {
            const result = await this.newsCategoryService.getAllNewsCategories()
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public getNewsCategoryById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.newsCategoryService.getNewsCategoryById(parseInt(id))
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public createNewsCategory = async (req: Request, res: Response) => {
        try {
            const result = await this.newsCategoryService.createNewsCategory(req.body)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public updateNewsCategory = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.newsCategoryService.updateNewsCategory(parseInt(id), req.body)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public deleteNewsCategory = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.newsCategoryService.deleteNewsCategory(parseInt(id))
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }
}
