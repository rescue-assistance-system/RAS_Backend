import CasesReport from '~/database/models/case_report.model'
import SosRequest from '~/database/models/sos.model'
import User from '~/database/models/user.model'
import { Op } from 'sequelize'
import { NotificationType } from '~/enums/notification-types.enum'
import { SosResponseDto } from '~/dtos/sos-request.dto'
import { SosService } from './sos.service'
import { CaseStatus } from '~/enums/case-status.enum'
import RescueTeam from '~/database/models/rescue_team.model'
import { SosMessageDto } from '~/dtos/sos-message.dto'
import { TrackingService } from './tracking.service'

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
            if (!coordinatorId || isNaN(Number(coordinatorId))) {
                throw new Error('Invalid coordinatorId')
            }
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
                assigned_by: Number(coordinatorId)
            })
            console.log(`Case ${caseId} has been assigned to team ${teamId} by coordinator ${coordinatorId}.`)
            await RescueTeam.update({ status: 'busy' }, { where: { user_id: teamId } })

            // get user information from the case
            const userId = caseToUpdate.dataValues.from_id
            const user = await User.findOne({ where: { id: userId } })
            const userName = user?.username
            const userAvatar = user?.avatar

            //get team information
            const rescueTeamUser = await User.findOne({ where: { id: teamId } })
            const teamUserName = rescueTeamUser?.username
            const teamAvatar = rescueTeamUser?.avatar
            // Send notification to the rescue team
            const notification = {
                type: NotificationType.CASE_ASSIGNED,
                message: `You have been assigned to case ${caseId} by the coordinator.`,
                sosMesage: new SosMessageDto({
                    message: `You have been assigned to case ${caseId} by the coordinator.`,
                    caseId: caseId,
                    userName: userName,
                    avatar: userAvatar
                })
            }
            await new SosService().sendNotificationToUser([teamId], notification)

            // Send notification to the user who created the case
            // const userId = caseToUpdate.dataValues.from_id
            const userNotification = {
                type: NotificationType.CASE_ASSIGNED,
                sosMesage: new SosMessageDto({
                    message: `Your case ${caseId} has been assigned to a rescue team by the coordinator ${teamUserName}.`,
                    caseId: caseId,
                    teamId: teamId,
                    userName: teamUserName,
                    avatar: teamAvatar
                })
            }
            await new SosService().sendNotificationToUser([userId], userNotification)

            //send notification to the trackers
            // const trackingService = new TrackingService()
            // const trackers = await trackingService.getTrackers(userId)
            // const activeTrackers = trackers.filter((tracker) => tracker.tracking_status === true)
            // if (activeTrackers.length > 0) {
            //     const trackerIds = activeTrackers.map((tracker) => tracker.user_id)
            //     const trackerNotification = {
            //         type: NotificationType.CASE_ASSIGNED,
            //         sosMesage: new SosMessageDto({
            //             message: `Your friend (userId: ${userName})'s case ${caseId} has been assigned to a rescue team by the coordinator.`,
            //             caseId: caseId,
            //             teamId: teamId,
            //             userName: userName,
            //             avatar: userAvatar
            //         })
            //     }
            // }
            const trackingService = new TrackingService()
            const trackers = await trackingService.getTrackers(parseInt(userId))
            const activeTrackers = trackers.filter((tracker) => tracker.tracking_status === true)
            if (activeTrackers.length > 0) {
                const trackerIds = activeTrackers.map((tracker) => tracker.user_id)
                const trackingNotification = {
                    type: NotificationType.CASE_ASSIGNED,
                    sosMesage: new SosMessageDto({
                        message: `Your friend (userId: ${userName})'s case ${caseId} has been assigned to a rescue team by the coordinator.`,
                        caseId: caseId,
                        teamId: teamId,
                        userName: userName,
                        avatar: userAvatar
                    })
                }
                await new SosService().sendNotificationToUser(trackerIds, trackingNotification)
            }
            // await new SosService().sendNotificationToUser(trackerIds, trackerNotification)
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
                sosMesage: new SosMessageDto({
                    message: message,
                    caseId: caseId
                })
            }

            for (const teamId of Array.from(allNearestTeamIds)) {
                await new SosService().sendNotificationToUser([teamId], notification)
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
                sosMesage: new SosMessageDto({
                    message: message,
                    caseId: caseId
                })
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
