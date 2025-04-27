import { Request, Response } from 'express'
import { NewsService } from '../../services/adminService/news.service'
import { createResponse } from '../../utils/response.utils'

export class NewsController {
    private readonly newsService: NewsService

    constructor() {
        this.newsService = new NewsService()
    }

    public getAllNews = async (req: Request, res: Response) => {
        try {
            const result = await this.newsService.getAllNews()
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public getNewsById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.newsService.getNewsById(parseInt(id))
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public createNews = async (req: Request, res: Response) => {
        try {
            const result = await this.newsService.createNews(req.body)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public updateNews = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.newsService.updateNews(parseInt(id), req.body)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public deleteNews = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const result = await this.newsService.deleteNews(parseInt(id))
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public searchNews = async (req: Request, res: Response) => {
        try {
            const { query } = req.params
            const result = await this.newsService.searchNews(query)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            res.status(400).json(createResponse('error', null, error.message))
        }
    }
}
