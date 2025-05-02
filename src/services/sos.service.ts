import User from '~/database/models/user.model'
import RescueTeam from '~/database/models/rescue_team.model'
import { SocketService } from '~/sockets/SocketService'
import { NotificationService } from '~/services/notification.service'
import { SocketManager } from '~/sockets/SocketManager'
import { SosRequestDto, SosResponseDto } from '~/dtos/sos-request.dto'
import CasesReport from '~/database/models/case_report.model'
import SosRequest from '~/database/models/sos.model'
import { CaseStatus } from '~/enums/case-status.enum'
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
        userId: number,
        notification: { type: string; message: string }
    ): Promise<void> {
        const socketId = await SocketManager.getSocketId(userId.toString())
        if (socketId) {
            // User Online
            await SocketService.getInstance().emitToSocket(socketId, 'sos_request', notification)
            console.log(`Notification sent to user ${userId} via socket`)
        } else {
            // User Offline
            await new NotificationService().sendNotification([userId.toString()], notification)
            console.log(`Notification sent to user ${userId} via FCM`)
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

    public async validateCaseStatus(caseId: number, expectedStatus: CaseStatus): Promise<CasesReport> {
        const caseToUpdate = await CasesReport.findOne({
            where: { id: caseId }
        })

        if (!caseToUpdate) {
            throw new Error(`Case with ID ${caseId} not found`)
        }

        if (caseToUpdate.status !== expectedStatus) {
            throw new Error(`Case with ID ${caseId} is not in ${expectedStatus} status.`)
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
            await Promise.all(
                availableTeams.map(async (team) => {
                    const teamId = team.user_id
                    const notification = {
                        type: 'sos_request',
                        message: `SOS request received for location (${latitude}, ${longitude}).`
                    }

                    try {
                        await this.sendNotificationToUser(teamId, notification)
                        notifiedTeamIds.push(teamId.toString())
                    } catch (error) {
                        console.error(`Error sending SOS to team ${teamId}:`, error)
                    }
                })
            )
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
                    CaseStatus.READY
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

            await caseToUpdate.update({ status: CaseStatus.CANCELLED, cancelled_at: new Date() })
            console.log(`Case ${caseId} marked as cancelled.`)

            // Notify all teams in the SOS list
            const allNearestTeamIds = await this.getNearestTeamIds(caseToUpdate.sos_list || [])
            await Promise.all(
                Array.from(allNearestTeamIds).map((teamId) =>
                    this.sendNotificationToUser(teamId, {
                        type: 'case_cancelled',
                        message: `Case ${caseId} has been marked as cancelled. The user is safe.`
                    })
                )
            )
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

            const userId = caseToUpdate.from_id
            await this.sendNotificationToUser(userId, {
                type: 'case_accepted',
                message: `Your case ${caseId} has been accepted by a rescue team (${teamId}).`
            })

            // Notify other rescue teams
            const sosList = caseToUpdate.sos_list || []
            const allNearestTeamIds = await this.getNearestTeamIds(sosList)
            const remainingTeamIds = Array.from(allNearestTeamIds).filter((id) => id !== teamId)

            await Promise.all(
                remainingTeamIds.map((otherTeamId) =>
                    this.sendNotificationToUser(otherTeamId, {
                        type: 'case_accepted',
                        message: `Case ${caseId} has been accepted by team ${teamId}.`
                    })
                )
            )
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

            await Promise.all(
                remainingTeamIds.map((otherTeamId) =>
                    this.sendNotificationToUser(otherTeamId, {
                        type: 'case_rejected',
                        message: `Case ${caseId} has been rejected by team ${teamId}.`
                    })
                )
            )

            // Notify the user
            const userId = caseToUpdate.from_id
            await this.sendNotificationToUser(userId, {
                type: 'case_rejected',
                message: `Case ${caseId} has been rejected by team ${teamId}.`
            })
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
            // Validate status transition
            const validTransitions: Record<CaseStatus, CaseStatus[]> = {
                [CaseStatus.PENDING]: [CaseStatus.ACCEPTED],
                [CaseStatus.ACCEPTED]: [CaseStatus.READY],
                [CaseStatus.READY]: [CaseStatus.COMPLETED],
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
            await this.sendNotificationToUser(userId, {
                type: 'case_status_updated',
                message: `The status of your case ${caseId} has been updated to ${newStatus} by the rescue team.`
            })
        } catch (error: any) {
            console.error('Error changing case status:', error)
            throw new Error(`Failed to change case status: ${error.message}`)
        }
    }
}
