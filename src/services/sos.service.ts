import User from '~/database/models/user.model'
import RescueTeam from '~/database/models/rescue_team.model'
import { SocketService } from '~/sockets/SocketService'
import { NotificationService } from '~/services/notification.service'
import { SosRequestDto, SosResponseDto } from '~/dtos/sos-request.dto'
import CasesReport from '~/database/models/case_report.model'
import SosRequest from '~/database/models/sos.model'
import { CaseStatus } from '../enums/case-status.enum'
import { NotificationType } from '~/enums/notification-types.enum'
import { TrackingService } from './tracking.service'
import { Op } from 'sequelize'
export class SosService {
    // calculate distance between two coordinates using Haversine formula
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371 // Radius of Earth (km)
        const dLat = (lat2 - lat1) * (Math.PI / 180)
        const dLon = (lon2 - lon1) * (Math.PI / 180)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c // km
    }

    private async findAvailableTeams(latitude: number, longitude: number, radius: number): Promise<any[]> {
        try {
            const teams = await RescueTeam.findAll({
                where: {
                    status: 'available'
                }
            })

            const nearbyTeams = teams.filter((team) => {
                const distance = this.calculateDistance(
                    latitude,
                    longitude,
                    team.default_latitude,
                    team.default_longitude
                )
                return distance <= radius
            })

            return nearbyTeams
        } catch (error: any) {
            console.error('Error finding available teams:', error)
            throw new Error(`Failed to find available teams: ${error.message}`)
        }
    }

    public async sendNotificationToUser(
        userIds: number[],
        notification: { type: string; message: string }
    ): Promise<void> {
        const userIdStrings = userIds.map((id) => id.toString())

        const onlineUsers = await SocketService.getInstance().getListOnlineUsers(userIdStrings)
        const offlineUsers = userIdStrings.filter((id) => !onlineUsers.includes(id))

        if (onlineUsers.length > 0) {
            await SocketService.getInstance().sendToOnlineUsers(onlineUsers, notification.type, notification)
        }

        if (offlineUsers.length > 0) {
            await new NotificationService().sendToOfflineUsers(offlineUsers, notification)
        }
    }

    public async getNearestTeamIds(sosList: number[]): Promise<Set<number>> {
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
        return allNearestTeamIds
    }

    public async validateCaseStatus(caseId: number, expectedStatuses: CaseStatus | CaseStatus[]): Promise<CasesReport> {
        const caseToUpdate = await CasesReport.findOne({
            where: { id: caseId }
        })

        if (!caseToUpdate) {
            throw new Error(`Case with ID ${caseId} not found`)
        }

        const currentStatus = caseToUpdate.status as CaseStatus

        const validStatuses = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses]
        if (!validStatuses.includes(currentStatus)) {
            throw new Error(
                `Case with ID ${caseId} is not in a valid status. Expected: ${validStatuses.join(', ')}, but got: ${currentStatus}.`
            )
        }

        return caseToUpdate
    }

    public async sendSosRequest(data: SosRequestDto): Promise<string[]> {
        try {
            const { userId, latitude, longitude, address } = data
            const radii = [5, 10, 20, 30]
            let availableTeams: any[] = []
            //find rescue teams in radius
            for (const radius of radii) {
                availableTeams = await this.findAvailableTeams(latitude, longitude, radius)
                console.log('Radius:', radius, 'Available teams:', availableTeams)
                if (availableTeams.length > 0) break
            }

            if (availableTeams.length === 0) {
                console.log('No teams found within 30km. Sending to all rescue teams.')
                availableTeams = await RescueTeam.findAll({
                    where: { status: 'available' }
                })
            }

            const notifiedTeamIds: string[] = []

            //send SOS signal to RCs
            const teamIds = availableTeams.map((team) => team.user_id)
            const notification = {
                type: NotificationType.SOS_REQUEST,
                message: `SOS request received for location (${latitude}, ${longitude}).`
            }

            await this.sendNotificationToUser(teamIds, notification)
            notifiedTeamIds.push(...teamIds.map((id) => id.toString()))

            //send SOS signal to trackers
            const trackingService = new TrackingService()
            const trackers = await trackingService.getTrackers(parseInt(userId))
            const activeTrackers = trackers.filter((tracker) => tracker.tracking_status === true)
            if (activeTrackers.length > 0) {
                const trackerIds = activeTrackers.map((tracker) => tracker.user_id)
                const trackingNotification = {
                    type: NotificationType.SOS_REQUEST,
                    message: ` SOS request received for location (${latitude}, ${longitude}).`,
                    address
                }
                await this.sendNotificationToUser(trackerIds, trackingNotification)
            }

            const nearestTeamIds = notifiedTeamIds
                .map((id) => {
                    const teamIdNum = parseInt(id)
                    if (isNaN(teamIdNum)) {
                        console.error(`Invalid teamId: ${id}. Skipping this team.`)
                        return null
                    }
                    return teamIdNum
                })
                .filter((id) => id !== null)

            const userIdNum = parseInt(userId)
            if (isNaN(userIdNum)) {
                throw new Error('Invalid userId')
            }

            const latestCase = await CasesReport.findOne({
                where: {
                    from_id: userIdNum
                },
                order: [['created_at', 'DESC']]
            })
            let caseToUse: CasesReport

            if (latestCase) {
                // CHeck status of case
                const isCaseOpen = ![
                    CaseStatus.COMPLETED,
                    CaseStatus.CANCELLED,
                    CaseStatus.ACCEPTED,
                    CaseStatus.READY,
                    CaseStatus.EXPIRED
                ].includes(latestCase.dataValues.status)
                console.log('Latest case status:', latestCase.dataValues.status)

                // Check if the latest case is open and within the time limit
                if (isCaseOpen) {
                    caseToUse = latestCase
                } else {
                    caseToUse = await CasesReport.create({
                        status: CaseStatus.PENDING,
                        from_id: userIdNum,
                        sos_list: []
                    })
                }
            } else {
                caseToUse = await CasesReport.create({
                    status: CaseStatus.PENDING,
                    from_id: userIdNum,
                    sos_list: []
                })
            }
            const sosRequest = await SosRequest.create({
                user_id: userIdNum,
                latitude,
                longitude,
                nearest_team_ids: nearestTeamIds,
                case_id: caseToUse.id
            })

            const updatedSosList = Array.isArray(caseToUse.sos_list)
                ? [...caseToUse.sos_list, sosRequest.id]
                : [sosRequest.id]
            await caseToUse.update({ sos_list: updatedSosList })

            return notifiedTeamIds
        } catch (error: any) {
            console.error('Error sending SOS request:', error)
            throw new Error(`Failed to send SOS request: ${error.message}`)
        }
    }

    public async markSafe(caseId: number): Promise<void> {
        try {
            const caseToUpdate = await this.validateCaseStatus(caseId, CaseStatus.PENDING)

            await caseToUpdate.update({ status: CaseStatus.SAFE, cancelled_at: new Date() })
            console.log(`Case ${caseId} marked as cancelled.`)

            // Notify all teams in the SOS list
            const allNearestTeamIds = await this.getNearestTeamIds(caseToUpdate.sos_list || [])
            const notification = {
                type: NotificationType.CASE_SAFE,
                message: `Case ${caseId} has been marked as cancelled. The user is safe.`
            }

            await this.sendNotificationToUser(Array.from(allNearestTeamIds), notification)
        } catch (error: any) {
            console.error('Error marking case as safe:', error)
            throw new Error(`Failed to mark case as safe: ${error.message}`)
        }
    }

    public async acceptCase(teamId: number, caseId: number): Promise<void> {
        try {
            const caseToUpdate = await this.validateCaseStatus(caseId, CaseStatus.PENDING)
            await caseToUpdate.update({
                status: CaseStatus.ACCEPTED,
                accepted_team_id: teamId,
                accepted_at: new Date()
            })

            console.log(`Case ${caseId} has been accepted by team ${teamId}.`)

            await RescueTeam.update({ status: 'busy' }, { where: { user_id: teamId } })

            const userId = caseToUpdate.from_id

            // Notify other rescue teams
            const sosList = caseToUpdate.sos_list || []
            const allNearestTeamIds = await this.getNearestTeamIds(sosList)
            const remainingTeamIds = Array.from(allNearestTeamIds).filter((id) => id !== teamId)

            const userNotification = {
                type: NotificationType.CASE_ACCEPTED,
                message: `Your case ${caseId} has been accepted by a rescue team (${teamId}).`
            }

            const teamNotification = {
                type: NotificationType.CASE_ACCEPTED,
                message: `Case ${caseId} has been accepted by team ${teamId}.`
            }

            await this.sendNotificationToUser([userId], userNotification)
            await this.sendNotificationToUser(remainingTeamIds, teamNotification)
        } catch (error: any) {
            console.error('Error accepting case:', error)
            throw new Error(`Failed to accept case: ${error.message}`)
        }
    }

    public async rejectCase(teamId: number, caseId: number): Promise<void> {
        try {
            const caseToUpdate = await this.validateCaseStatus(caseId, CaseStatus.PENDING)

            const rejectedTeamIds = caseToUpdate.rejected_team_ids || []

            if (rejectedTeamIds.includes(teamId)) {
                throw new Error(`Team ${teamId} has already rejected case ${caseId}.`)
            }

            rejectedTeamIds.push(teamId)
            await caseToUpdate.update({ rejected_team_ids: rejectedTeamIds })

            console.log(`Team ${teamId} has rejected case ${caseId}.`)

            // Notify remaining teams
            const sosList = caseToUpdate.sos_list || []
            const allNearestTeamIds = await this.getNearestTeamIds(sosList)
            const remainingTeamIds = Array.from(allNearestTeamIds).filter((id) => !rejectedTeamIds.includes(id))
            // Notify the user
            const userId = caseToUpdate.from_id

            const teamNotification = {
                type: NotificationType.CASE_REJECTED,
                message: `Case ${caseId} has been rejected by team ${teamId}.`
            }

            const userNotification = {
                type: NotificationType.CASE_REJECTED,
                message: `Case ${caseId} has been rejected by team ${teamId}.`
            }

            await this.sendNotificationToUser(remainingTeamIds, teamNotification)
            await this.sendNotificationToUser([userId], userNotification)
        } catch (error: any) {
            console.error('Error rejecting case:', error)
            throw new Error(`Failed to reject case: ${error.message}`)
        }
    }

    public async changeStatus(teamId: number, caseId: number, newStatus: CaseStatus): Promise<void> {
        try {
            const caseToUpdate = await CasesReport.findOne({
                where: { id: caseId }
            })

            if (!caseToUpdate) {
                throw new Error(`Case with ID ${caseId} not found.`)
            }

            if (caseToUpdate.dataValues.accepted_team_id !== teamId) {
                throw new Error(`Team ${teamId} is not authorized to update the status of case ${caseId}.`)
            }

            if (caseToUpdate.dataValues.status === newStatus) {
                throw new Error(`Case ${caseId} is already in status ${newStatus}.`)
            }
            if (newStatus === CaseStatus.COMPLETED || newStatus === CaseStatus.CANCELLED) {
                throw new Error(
                    `Cannot change status to ${newStatus}. Please use the dedicated API for completing or cancelling a case with a reason or description.`
                )
            }
            // Validate status transition
            const validTransitions: Record<CaseStatus, CaseStatus[]> = {
                [CaseStatus.PENDING]: [CaseStatus.ACCEPTED],
                [CaseStatus.ACCEPTED]: [CaseStatus.READY],
                [CaseStatus.READY]: [],
                [CaseStatus.COMPLETED]: [],
                [CaseStatus.CANCELLED]: []
            }

            const currentStatus = caseToUpdate.dataValues.status as CaseStatus
            const allowedNextStatuses = validTransitions[currentStatus]
            if (!allowedNextStatuses.includes(newStatus)) {
                throw new Error(
                    `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedNextStatuses.join(
                        ', '
                    )}.`
                )
            }

            const timestampColumnMap: Record<CaseStatus, string> = {
                [CaseStatus.ACCEPTED]: 'accepted_at',
                [CaseStatus.READY]: 'ready_at',
                [CaseStatus.COMPLETED]: 'completed_at',
                [CaseStatus.CANCELLED]: 'cancelled_at'
            }

            const timestampColumn = timestampColumnMap[newStatus]
            if (!timestampColumn) {
                throw new Error(`Unsupported status: ${newStatus}`)
            }

            const updateData: Partial<CasesReport> = {
                status: newStatus,
                [timestampColumn]: new Date()
            }

            await caseToUpdate.update(updateData)
            console.log(`Case ${caseId} status updated to ${newStatus} by team ${teamId}.`)

            const userId = caseToUpdate.dataValues.from_id
            const notification = {
                type: NotificationType.CASE_STATUS_UPDATED,
                message: `The status of your case ${caseId} has been updated to ${newStatus} by the rescue team.`
            }

            await this.sendNotificationToUser([userId], notification)
        } catch (error: any) {
            console.error('Error changing case status:', error)
            throw new Error(`Failed to change case status: ${error.message}`)
        }
    }

    public async cancelCaseByRescueTeam(teamId: number, caseId: number, reason: string): Promise<void> {
        try {
            const caseToUpdate = await this.validateCaseStatus(caseId, [CaseStatus.ACCEPTED, CaseStatus.READY])

            await caseToUpdate.update({
                status: CaseStatus.CANCELLED,
                cancelled_at: new Date(),
                cancelled_reason: reason
            })

            console.log(`Case ${caseId} has been marked as cancelled by team ${teamId}.`)
            await RescueTeam.update({ status: 'available' }, { where: { user_id: teamId } })
            const userId = caseToUpdate.from_id
            const notification = {
                type: NotificationType.CASE_CANCELLED,
                message: `Your case ${caseId} has been marked as cancelled by the rescue team ${teamId}. Reason: ${reason}`
            }

            await this.sendNotificationToUser([userId], notification)
        } catch (error: any) {
            console.error('Error cancelling case:', error)
            throw new Error(`Failed to cancel case: ${error.message}`)
        }
    }

    public async completedCase(teamId: number, caseId: number, description: string): Promise<void> {
        try {
            const caseToUpdate = await this.validateCaseStatus(caseId, CaseStatus.READY)

            await caseToUpdate.update({
                status: CaseStatus.COMPLETED,
                completed_at: new Date(),
                completed_description: description
            })

            console.log(`Case ${caseId} has been marked as completed by team ${teamId}. Description: ${description}`)

            await RescueTeam.update({ status: 'available' }, { where: { user_id: teamId } })

            const userId = caseToUpdate.from_id
            const notification = {
                type: NotificationType.CASE_COMPLETED,
                message: `Your case ${caseId} has been marked as completed by the rescue team (${teamId}). Description: ${description}`
            }

            await this.sendNotificationToUser([userId], notification)
        } catch (error: any) {
            console.error('Error marking case as completed:', error)
            throw new Error(`Failed to mark case as completed: ${error.message}`)
        }
    }

    private mapSosRequestsToCases(sosRequests: SosRequest[]): any[] {
        const casesMap: Record<number, any> = {}

        sosRequests.forEach((sos) => {
            const caseId = sos.case_id
            if (!caseId) return

            if (!casesMap[caseId]) {
                casesMap[caseId] = {
                    case: sos.case,
                    user: sos.user,
                    sosRequests: []
                }
            }

            casesMap[caseId].sosRequests.push({
                id: sos.id,
                user_id: sos.user_id,
                latitude: sos.latitude,
                longitude: sos.longitude,
                created_at: sos.created_at,
                updated_at: sos.updated_at,
                nearest_team_ids: sos.nearest_team_ids
            })
        })

        return Object.values(casesMap).sort((a: any, b: any) => {
            return new Date(b.case.created_at).getTime() - new Date(a.case.created_at).getTime()
        })
    }

    private async fetchSosRequests(filter: any): Promise<SosRequest[]> {
        return await SosRequest.findAll({
            where: filter,
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
            ],
            order: [['created_at', 'DESC']]
        })
    }

    public async getAllSosRequestsForTeam(teamId: number): Promise<SosResponseDto[]> {
        try {
            const sosRequests = await this.fetchSosRequests({
                nearest_team_ids: { [Op.contains]: [teamId] },
                case_id: { [Op.ne]: null }
            })

            return this.mapSosRequestsToCases(sosRequests)
        } catch (error: any) {
            console.error('Error fetching SOS requests for team:', error)
            throw new Error(`Failed to fetch SOS requests for team: ${error.message}`)
        }
    }
    public async getUserCases(userId: number): Promise<SosResponseDto[]> {
        try {
            const sosRequests = await this.fetchSosRequests({
                user_id: userId,
                case_id: { [Op.ne]: null }
            })

            return this.mapSosRequestsToCases(sosRequests)
        } catch (error: any) {
            console.error('Error fetching user cases:', error)
            throw new Error(`Failed to fetch user cases: ${error.message}`)
        }
    }
}
