import CasesReport from '~/database/models/case_report.model'
import SosRequest from '~/database/models/sos.model'
import User from '~/database/models/user.model'
import { Op } from 'sequelize'
import { NotificationType } from '~/enums/notification-types.enum'
import { SosResponseDto } from '~/dtos/sos-request.dto'
import { SosService } from './sos.service'
import { CaseStatus } from '~/enums/case-status.enum'
import RescueTeam from '~/database/models/rescue_team.model'

export class CoordinatorSosService {
    private sosService = new SosService()

    public async getAllSosRequestsForCoordinator(): Promise<SosResponseDto[]> {
        try {
            const sosRequests = await this.sosService.fetchSosRequests({
                case_id: { [Op.ne]: null }
            })

            return this.sosService.mapSosRequestsToCases(sosRequests)
        } catch (error: any) {
            console.error('Error fetching SOS requests for team:', error)
            throw new Error(`Failed to fetch SOS requests for team: ${error.message}`)
        }
    }

    // Get detail SOS request by ID
    public async getSosRequestById(sosId: number): Promise<SosResponseDto | null> {
        try {
            const sosRequest = await SosRequest.findOne({
                where: { id: sosId },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: CasesReport,
                        as: 'case',
                        attributes: ['id', 'status', 'created_at']
                    }
                ]
            })

            if (!sosRequest) {
                return null
            }

            return sosRequest.toJSON() as SosResponseDto
        } catch (error: any) {
            console.error('Error fetching SOS request by ID:', error)
            throw new Error(`Failed to fetch SOS request by ID: ${error.message}`)
        }
    }

    public async getAvailableRescueTeams(): Promise<any[]> {
        try {
            const availableTeams = await RescueTeam.findAll({
                where: { status: 'available' },
                attributes: ['id', 'team_name', 'status', 'default_latitude', 'default_longitude']
            })

            return availableTeams
        } catch (error: any) {
            console.error('Error fetching available rescue teams:', error)
            throw new Error(`Failed to fetch available rescue teams: ${error.message}`)
        }
    }

    public async getSosStatistics(): Promise<any> {
        try {
            const totalCases = await CasesReport.count()

            const pendingCases = await CasesReport.count({ where: { status: 'pending' } })

            const completedCases = await CasesReport.count({ where: { status: 'completed' } })

            return {
                total: totalCases,
                pending: pendingCases,
                completed: completedCases
            }
        } catch (error: any) {
            console.error('Error fetching SOS statistics:', error)
            throw new Error(`Failed to fetch SOS statistics: ${error.message}`)
        }
    }
    public async assignTeamToCase(teamId: number, caseId: number, coordinatorId: number): Promise<void> {
        try {
            const caseToUpdate = await CasesReport.findOne({
                where: { id: caseId }
            })

            if (!caseToUpdate) {
                throw new Error(`Case with ID ${caseId} not found.`)
            }

            if (caseToUpdate.dataValues.accepted_team_id !== null) {
                throw new Error(
                    `Case ${caseId} has already been assigned to a team : ${caseToUpdate.dataValues.accepted_team_id}. `
                )
            }

            const rescueTeam = await RescueTeam.findOne({
                where: { user_id: teamId }
            })

            if (!rescueTeam) {
                throw new Error(`Rescue team with ID ${teamId} not found.`)
            }
            if (rescueTeam.dataValues.status === 'busy') {
                throw new Error(
                    `Rescue team with ID ${teamId} is currently busy and cannot be assigned to case ${caseId}.`
                )
            }

            await caseToUpdate.update({
                status: CaseStatus.ACCEPTED,
                accepted_team_id: teamId,
                accepted_at: new Date(),
                assigned_by: coordinatorId
            })
            console.log(`Case ${caseId} has been assigned to team ${teamId} by coordinator ${coordinatorId}.`)
            await RescueTeam.update({ status: 'busy' }, { where: { user_id: teamId } })
            const notification = {
                type: NotificationType.CASE_ASSIGNED,
                message: `You have been assigned to case ${caseId} by the coordinator.`
            }
            await new SosService().sendNotificationToUser([teamId], notification)

            const userId = caseToUpdate.dataValues.from_id
            const userNotification = {
                type: NotificationType.CASE_ASSIGNED,
                message: `Your case ${caseId} has been assigned to a rescue team by the coordinator.`
            }
            await new SosService().sendNotificationToUser([userId], userNotification)
        } catch (error: any) {
            console.error('Error assigning team to case:', error)
            throw new Error(`Failed to assign team to case: ${error.message}`)
        }
    }

    public async notifyRescueTeams1(caseId: number, message: string): Promise<void> {
        try {
            const caseToUpdate = await CasesReport.findOne({
                where: { id: caseId }
            })

            if (!caseToUpdate) {
                throw new Error(`Case with ID ${caseId} not found.`)
            }

            const sosList = caseToUpdate.sos_list || []
            const allNearestTeamIds = new Set<number>()

            for (const sosId of sosList) {
                const sosRequest = await SosRequest.findOne({
                    where: { id: sosId }
                })

                if (sosRequest) {
                    const nearestTeamIds = sosRequest.nearest_team_ids || []
                    nearestTeamIds.forEach((id) => allNearestTeamIds.add(id))
                }
            }

            const notification = {
                type: NotificationType.CASE_UPDATE,
                message
            }

            for (const teamId of Array.from(allNearestTeamIds)) {
                await new SosService().sendNotificationToUser(teamId, notification)
            }
            console.log(`Notification sent to rescue teams for case ${caseId}.`)
        } catch (error: any) {
            console.error('Error notifying rescue teams:', error)
            throw new Error(`Failed to notify rescue teams: ${error.message}`)
        }
    }
    public async notifyRescueTeamOfCase(caseId: number, message: string): Promise<void> {
        try {
            const caseToUpdate = await CasesReport.findOne({
                where: { id: caseId },
                attributes: ['id', 'accepted_team_id']
            })

            if (!caseToUpdate) {
                throw new Error(`Case with ID ${caseId} not found.`)
            }

            const acceptedTeamId = caseToUpdate.accepted_team_id
            if (!acceptedTeamId) {
                throw new Error(`No team has accepted case with ID ${caseId}.`)
            }

            const notification = {
                type: NotificationType.CASE_UPDATE,
                message
            }

            await new SosService().sendNotificationToUser([acceptedTeamId], notification)

            console.log(`Notification sent to team ${acceptedTeamId} for case ${caseId}.`)
        } catch (error: any) {
            console.error('Error notifying rescue team:', error)
            throw new Error(`Failed to notify rescue team: ${error.message}`)
        }
    }

    public async getRescueTeamLocations(): Promise<any[]> {
        try {
            const rescueTeams = await RescueTeam.findAll({
                attributes: ['id', 'team_name', 'default_latitude', 'default_longitude', 'status']
            })

            return rescueTeams.map((team) => ({
                id: team.id,
                name: team.team_name,
                latitude: team.default_latitude,
                longitude: team.default_longitude,
                status: team.status
            }))
        } catch (error: any) {
            console.error('Error fetching rescue team locations:', error)
            throw new Error(`Failed to fetch rescue team locations: ${error.message}`)
        }
    }
}
