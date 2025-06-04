import { Op, fn, col, literal, where, Sequelize } from 'sequelize'
import SosRequest from '../database/models/sos.model'
import CasesReport from '../database/models/case_report.model'
import RescueTeam from '../database/models/rescue_team.model'
import { CaseStatus } from '~/enums/case-status.enum'

export class AnalyticsService {
    // KPI Dashboard
    public async getDashboard() {
        // Tổng số case (không phải số tín hiệu SOS)
        const total = await CasesReport.count()
        // Số case đã xử lý (giả sử status = 'completed')
        const completed = await CasesReport.count({ where: { status: 'completed' } })
        // Thời gian phản hồi trung bình (phút) = thời gian rescue team nhận cứu - thời gian tạo case
        const casesWithAcceptRaw = await CasesReport.findAll({
            where: {
                accepted_at: { [Op.ne]: null }
            },
            attributes: ['id', 'created_at', 'accepted_at', 'accepted_team_id'],
            raw: true
        })
        const casesWithAccept: Array<{
            id: number
            created_at: string | Date
            accepted_at: string | Date
            accepted_team_id: number
        }> = casesWithAcceptRaw.map((c: any) => ({
            id: c.id,
            created_at: c.created_at,
            accepted_at: c.accepted_at,
            accepted_team_id: c.accepted_team_id
        }))
        const responseTimes = casesWithAccept
            .map((c) => (new Date(c.accepted_at).getTime() - new Date(c.created_at).getTime()) / 60000)
            .filter((time) => !isNaN(time) && time >= 0)
        const averageResponseTime =
            responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0
        // Số đội cứu hộ đang hoạt động (giả sử status = 'available' hoặc 'busy')
        const availableTeams = await RescueTeam.count({ where: { status: 'available' } })
        const busyTeams = await RescueTeam.count({ where: { status: 'busy' } })

        // Tìm đội cứu hộ có tốc độ phản hồi trung bình chậm nhất
        // Lấy tất cả case đã được accept và có accepted_team_id
        const casesWithTeamRaw = await CasesReport.findAll({
            where: {
                accepted_at: { [Op.ne]: null },
                accepted_team_id: { [Op.ne]: null }
            },
            attributes: ['created_at', 'accepted_at', 'accepted_team_id'],
            raw: true
        })
        const casesWithTeam: Array<{
            created_at: string | Date
            accepted_at: string | Date
            accepted_team_id: number
        }> = casesWithTeamRaw.map((c: any) => ({
            created_at: c.created_at,
            accepted_at: c.accepted_at,
            accepted_team_id: c.accepted_team_id
        }))
        // Gom nhóm theo accepted_team_id
        const teamResponseMap: Record<number, number[]> = {}
        casesWithTeam.forEach((c) => {
            const teamId = c.accepted_team_id
            const respTime = (new Date(c.accepted_at).getTime() - new Date(c.created_at).getTime()) / 60000
            if (!isNaN(respTime) && respTime >= 0) {
                if (!teamResponseMap[teamId]) teamResponseMap[teamId] = []
                teamResponseMap[teamId].push(respTime)
            }
        })
        // Tìm đội có tốc độ phản hồi trung bình lớn nhất
        let slowestTeamId: number | null = null
        let slowestAvg: number = -1
        Object.entries(teamResponseMap).forEach(([teamId, arr]) => {
            const avg = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
            if (avg > slowestAvg) {
                slowestAvg = avg
                slowestTeamId = Number(teamId)
            }
        })
        let slowestTeamInfo = null
        if (slowestTeamId) {
            const team = await RescueTeam.findOne({ where: { id: slowestTeamId }, raw: true })
            if (team) {
                slowestTeamInfo = {
                    teamId: team.id,
                    teamName: team.team_name,
                    averageResponseTime: Math.round(slowestAvg),
                    unit: 'minutes'
                }
            }
        }

        // Tìm case có thời gian phản hồi lâu nhất
        let slowestCase: {
            caseId: number | null
            responseTime: number
            unit: string
            created_at: string | Date
            accepted_at: string | Date
            accepted_team_id: number | null
        } | null = null
        if (casesWithAccept.length > 0) {
            let maxIdx = 0
            let maxTime = responseTimes[0]
            for (let i = 1; i < responseTimes.length; i++) {
                if (responseTimes[i] > maxTime) {
                    maxTime = responseTimes[i]
                    maxIdx = i
                }
            }
            const slowest = casesWithAccept[maxIdx]
            slowestCase = {
                caseId: slowest.id || null,
                responseTime: Math.round(maxTime),
                unit: 'minutes',
                created_at: slowest.created_at,
                accepted_at: slowest.accepted_at,
                accepted_team_id: slowest.accepted_team_id || null
            }
        }

        return {
            currentCaseReportCount: { total, completed },
            averageResponseTime: {
                value: averageResponseTime,
                unit: 'minutes'
            },
            availableTeams,
            busyTeams,
            slowestTeam: slowestTeamInfo,
            slowestCase
        }
    }

    // SOS Overview (Bar Chart)
    public async getSosStats(startDate?: string, endDate?: string) {
        // Group by month, count by status
        const whereClause: any = {}
        if (startDate && endDate) {
            whereClause.created_at = { [Op.between]: [startDate, endDate] }
        }
        const stats = await CasesReport.findAll({
            attributes: [
                [fn('to_char', col('created_at'), 'Mon'), 'month'],
                'status',
                [fn('COUNT', col('id')), 'count']
            ],
            where: whereClause,
            group: ['month', 'status'],
            raw: true
        })

        // Map to {month, pending, processed, resolved}
        const result: Record<string, any> = {}
        stats.forEach((row: any) => {
            const month = row.month
            if (!result[month])
                result[month] = { month, safe: 0, expired: 0, pending: 0, completed: 0, ready: 0, cancelled: 0 }
            if (row.status === CaseStatus.PENDING) result[month].pending = Number(row.count)
            if (row.status === CaseStatus.CANCELLED) result[month].cancelled = Number(row.count)
            if (row.status === CaseStatus.COMPLETED) result[month].completed = Number(row.count)
            if (row.status === CaseStatus.EXPIRED) result[month].expired = Number(row.count)
            if (row.status === CaseStatus.SAFE) result[month].safe = Number(row.count)
            if (row.status === CaseStatus.READY) result[month].ready = Number(row.count)
        })
        return Object.values(result)
    }

    // Hotspot Distribution (Pie Chart)
    public async getLocationData(startDate?: string, endDate?: string) {
        const whereClause: any = {}
        if (startDate && endDate) {
            whereClause.created_at = { [Op.between]: [startDate, endDate] }
        }
        // Lấy tất cả các bản ghi SOS, nhóm theo vị trí (không group theo user
        const stats = await SosRequest.findAll({
            attributes: [[fn('CONCAT', col('latitude'), ',', col('longitude')), 'location']],
            where: whereClause,
            raw: true
        })
        const locationCountMap: Record<string, number> = {}
        stats.forEach((row: any) => {
            const loc = row.location || 'Unknown'
            locationCountMap[loc] = (locationCountMap[loc] || 0) + 1
        })
        const result = Object.entries(locationCountMap).map(([location, count]) => ({ location, count }))
        return result
    }

    // SOS Success Rate & Team Performance
    public async getSosSuccessAndTeamPerformance() {
        // Success Rate
        const total = await SosRequest.count()
        const completed = await CasesReport.count({ where: { status: 'completed' } })
        const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

        // Team Performance
        // Tính trung bình thời gian phản hồi (phút) cho từng team
        const avgResponse = (await CasesReport.findAll({
            attributes: [
                'accepted_team_id',
                [fn('AVG', literal('EXTRACT(EPOCH FROM accepted_at - created_at)/60')), 'averageResponseTime'],
                [fn('COUNT', col('id')), 'tasksHandled']
            ],
            where: {
                accepted_at: { [Op.ne]: null },
                created_at: { [Op.ne]: null },
                accepted_team_id: { [Op.ne]: null }
            },
            group: ['accepted_team_id'],
            raw: true
        })) as Array<Record<string, any>>
        // Trung bình mỗi đội
        const teamCount = await RescueTeam.count()
        const avgTasksHandled =
            avgResponse.length > 0 && teamCount > 0
                ? Math.round(avgResponse.reduce((sum, t) => sum + Number(t['tasksHandled']), 0) / teamCount)
                : 0
        const averageResponseTime =
            avgResponse.length > 0
                ? Math.round(
                      avgResponse.reduce((sum, t) => sum + Number(t['averageResponseTime']), 0) / avgResponse.length
                  )
                : 0

        return {
            successRate,
            averageResponseTime,
            avgTasksHandled
        }
    }

    public async getCaseReportStats() {
        // Tổng số case completed và cancelled
        const [completedCount, cancelledCount] = await Promise.all([
            CasesReport.count({ where: { status: CaseStatus.COMPLETED } }),
            CasesReport.count({ where: { status: CaseStatus.CANCELLED } })
        ])

        // Top 3 rescue team có nhiều case completed nhất
        const topCompleted = (await CasesReport.findAll({
            attributes: ['accepted_team_id', [fn('COUNT', col('id')), 'completedCount']],
            where: { status: CaseStatus.COMPLETED, accepted_team_id: { [Op.ne]: null } },
            group: ['accepted_team_id'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            limit: 3,
            raw: true
        })) as any[]
        // Lấy thông tin team
        const completedTeams = await Promise.all(
            topCompleted.map(async (row) => {
                const team = await RescueTeam.findOne({ where: { user_id: row.accepted_team_id }, raw: true })
                return {
                    teamId: row.accepted_team_id,
                    teamName: team ? (team as any).team_name : 'Unknown',
                    completedCount: Number(row.completedCount)
                }
            })
        )

        // Top 3 rescue team có nhiều case cancelled nhất
        const topCancelled = (await CasesReport.findAll({
            attributes: ['accepted_team_id', [fn('COUNT', col('id')), 'cancelledCount']],
            where: { status: CaseStatus.CANCELLED, accepted_team_id: { [Op.ne]: null } },
            group: ['accepted_team_id'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            limit: 3,
            raw: true
        })) as any[]
        const cancelledTeams = await Promise.all(
            topCancelled.map(async (row) => {
                const team = await RescueTeam.findOne({ where: { user_id: row.accepted_team_id }, raw: true })
                return {
                    teamId: row.accepted_team_id,
                    teamName: team ? (team as any).team_name : 'Unknown',
                    cancelledCount: Number(row.cancelledCount)
                }
            })
        )

        return {
            completedCount,
            cancelledCount,
            topCompletedTeams: completedTeams,
            topCancelledTeams: cancelledTeams
        }
    }
}

export default new AnalyticsService()
