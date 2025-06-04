import { Request, Response } from 'express'
import AnalyticsService from '../services/analytics.service'
import { createResponse } from '~/utils/response.utils'

export class AnalyticsController {
    async getDashboard(req: Request, res: Response) {
        const data = await AnalyticsService.getDashboard()
        res.json(createResponse('success', data))
    }
    async getSosStats(req: Request, res: Response) {
        const { startDate, endDate } = req.query
        const data = await AnalyticsService.getSosStats(startDate as string, endDate as string)
        res.json(createResponse('success', data))
    }
    async getLocationData(req: Request, res: Response) {
        const { startDate, endDate } = req.query
        const data = await AnalyticsService.getLocationData(startDate as string, endDate as string)
        res.json(createResponse('success', data))
    }
    async getTeamPerformance(req: Request, res: Response) {
        const data = await AnalyticsService.getSosSuccessAndTeamPerformance()
        res.json(createResponse('success', data))
    }
    async getCaseReportStats(req: Request, res: Response) {
        const data = await AnalyticsService.getCaseReportStats()
        res.json(createResponse('success', data))
    }
}
