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
import { SosMessageDto } from '~/dtos/sos-message.dto'
import dayjs from 'dayjs'
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
        notification: { type: NotificationType; sosMesage: SosMessageDto }
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
                availableTeams = await RescueTeam.findAll({
                    where: { status: 'available' }
                })
            }

            const notifiedTeamIds: string[] = []
            const teamIds = availableTeams.map((team) => team.user_id)

            // Create case before sending SOS
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
                    CaseStatus.SAFE,
                    CaseStatus.EXPIRED
                ].includes(latestCase.dataValues.status)

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

            // Create SOS request
            const sosRequest = await SosRequest.create({
                user_id: userIdNum,
                latitude,
                longitude,
                nearest_team_ids: teamIds,
                case_id: caseToUse.id
            })

            const updatedSosList = Array.isArray(caseToUse.sos_list)
                ? [...caseToUse.sos_list, sosRequest.id]
                : [sosRequest.id]
            await caseToUse.update({ sos_list: updatedSosList })

            const user = await User.findOne({ where: { id: userId } })
            // update user latitude and longitude
            if (user) {
                await user.update({
                    latitude: latitude,
                    longitude: longitude
                })
            }
            const username = user?.username
            const avatar = user?.avatar
            //send SOS signal to RCs
            // const teamIds = availableTeams.map((team) => team.user_id)
            const notification = {
                type: NotificationType.SOS_REQUEST,
                sosMesage: new SosMessageDto({
                    message: `SOS request received for location (${latitude}, ${longitude}).`,
                    latitude,
                    longitude,
                    userName: username,
                    avatar: avatar,
                    address,
                    caseId: caseToUse.id,
                    userId: userIdNum
                })
            }

            await this.sendNotificationToUser(teamIds, notification)
            notifiedTeamIds.push(...teamIds.map((id) => id.toString()))

            //get coordinator information
            const coordinators = await User.findAll({ where: { role: 'coordinator' }, attributes: ['id'] })
            const coordinatorIds = coordinators.map((c) => c.id)

            // Send notification to the coordinators
            const coordinatorNotification = {
                type: NotificationType.SOS_REQUEST,
                sosMesage: new SosMessageDto({
                    message: `A new SOS request has been created by ${username}.`,
                    latitude,
                    longitude,
                    userName: username,
                    avatar: avatar,
                    address,
                    nearest_team_ids: teamIds,
                    caseId: caseToUse.id,
                    userId: userIdNum
                })
            }
            await new SosService().sendNotificationToUser(coordinatorIds, coordinatorNotification)
            //send SOS signal to trackers
            const trackingService = new TrackingService()
            const trackers = await trackingService.getTrackers(parseInt(userId))
            // const activeTrackers = trackers.filter((tracker) => tracker.tracking_status === true)
            if (trackers.length > 0) {
                const trackerIds = trackers.map((tracker) => tracker.user_id)
                const trackingNotification = {
                    type: NotificationType.SOS_REQUEST,
                    sosMesage: new SosMessageDto({
                        message: `SOS request received for location (${latitude}, ${longitude}).`,
                        userId: Number(userId),
                        userName: username,
                        avatar: avatar,
                        latitude,
                        longitude,
                        address,
                        caseId: caseToUse.id
                    })
                }
                await this.sendNotificationToUser(trackerIds, trackingNotification)
            }

            // const nearestTeamIds = notifiedTeamIds
            //     .map((id) => {
            //         const teamIdNum = parseInt(id)
            //         if (isNaN(teamIdNum)) {
            //             console.error(`Invalid teamId: ${id}. Skipping this team.`)
            //             return null
            //         }
            //         return teamIdNum
            //     })
            //     .filter((id) => id !== null)

            return { notifiedTeamIds, caseId: caseToUse.id }
        } catch (error: any) {
            console.error('Error sending SOS request:', error)
            throw new Error(`Failed to send SOS request: ${error.message}`)
        }
    }

    public async markSafe(caseId: number): Promise<void> {
        try {
            const caseToUpdate = await this.validateCaseStatus(caseId, [
                CaseStatus.PENDING,
                CaseStatus.ACCEPTED,
                CaseStatus.READY
            ])

            await caseToUpdate.update({ status: CaseStatus.SAFE, cancelled_at: new Date() })
            console.log(`Case ${caseId} marked as safe.`)
            // Update the status of the accepted team to available
            const acceptedTeamId = caseToUpdate.accepted_team_id
            if (acceptedTeamId) {
                await RescueTeam.update({ status: 'available' }, { where: { user_id: acceptedTeamId } })
            }
            // Get accountn rc username and avatar
            const userId = caseToUpdate.from_id
            const user = await User.findOne({ where: { id: userId } })
            const username = user?.username
            const avatar = user?.avatar
            // const userId = user?.id

            // Notify all teams in the SOS list
            const allNearestTeamIds = await this.getNearestTeamIds(caseToUpdate.sos_list || [])
            const notification = {
                type: NotificationType.CASE_SAFE,
                sosMesage: new SosMessageDto({
                    message: `Case ${caseId} has been marked as safe. The user is safe.`,
                    caseId: caseId,
                    userName: username,
                    avatar: avatar,
                    userId: userId
                })
            }

            await this.sendNotificationToUser(Array.from(allNearestTeamIds), notification)

            // Notify all trackers of the user
            const trackingService = new TrackingService()
            const trackers = await trackingService.getTrackers(userId)
            // const activeTrackers = trackers.filter((tracker) => tracker.tracking_status === true)
            if (trackers.length > 0) {
                const trackerIds = trackers.map((tracker) => tracker.user_id)
                const trackingNotification = {
                    type: NotificationType.CASE_SAFE,
                    sosMesage: new SosMessageDto({
                        message: `Your friend ${username}'s case ${caseId} has been marked as safe.`,
                        caseId: caseId,
                        userName: username,
                        avatar: avatar,
                        userId: userId
                    })
                }
                await this.sendNotificationToUser(trackerIds, trackingNotification)
            }
        } catch (error: any) {
            console.error('Error marking case as safe:', error)
            throw new Error(`Failed to mark case as safe: ${error.message}`)
        }
    }

    public async acceptCase(teamId: number, caseId: number, latitude?: number, longitude?: number): Promise<void> {
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

            // Get accountn rc username
            const user = await User.findOne({
                where: { id: teamId },
                attributes: ['username', 'avatar']
            })

            let lat = latitude
            let lng = longitude
            if (lat === undefined || lng === undefined) {
                const rescueTeam = await RescueTeam.findOne({ where: { user_id: teamId } })
                lat = rescueTeam?.latitude ?? rescueTeam?.default_latitude
                lng = rescueTeam?.longitude ?? rescueTeam?.default_longitude
            }

            const notification = {
                type: NotificationType.CASE_ACCEPTED,
                sosMesage: new SosMessageDto({
                    message: `Case ${caseId} has been accepted by rescue team (${user?.username}).`,
                    caseId: caseId,
                    teamId: teamId,
                    userName: user?.username,
                    avatar: user?.avatar,
                    latitude: lat,
                    longitude: lng
                })
            }

            await this.sendNotificationToUser([userId, ...remainingTeamIds], notification)
            // await this.sendNotificationToUser(remainingTeamIds, notification)
        } catch (error: any) {
            console.error('Error accepting case:', error)
            throw new Error(`Failed to accept case: ${error.message}`)
        }
    }

    public async rejectCase(teamId: number, caseId: number, latitude?: number, longitude?: number): Promise<void> {
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

            let lat = latitude
            let lng = longitude
            if (lat === undefined || lng === undefined) {
                const rescueTeam = await RescueTeam.findOne({ where: { user_id: teamId } })
                lat = rescueTeam?.latitude ?? rescueTeam?.default_latitude
                lng = rescueTeam?.longitude ?? rescueTeam?.default_longitude
            }

            const notification = {
                type: NotificationType.CASE_REJECTED,
                sosMesage: new SosMessageDto({
                    message: `Case ${caseId} has been rejected by team ${teamId}.`,
                    caseId: caseId,
                    teamId: teamId,
                    latitude: lat,
                    longitude: lng
                })
            }

            // const userNotification = {
            //     type: NotificationType.CASE_REJECTED,
            //     message: `Case ${caseId} has been rejected by team ${teamId}.`
            // }

            await this.sendNotificationToUser([userId, ...remainingTeamIds], notification)
            // await this.sendNotificationToUser([userId], userNotification)
        } catch (error: any) {
            console.error('Error rejecting case:', error)
            throw new Error(`Failed to reject case: ${error.message}`)
        }
    }

    public async changeStatus(
        teamId: number,
        caseId: number,
        newStatus: CaseStatus,
        latitude?: number,
        longitude?: number
    ): Promise<void> {
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
            let lat = latitude
            let lng = longitude
            if (lat === undefined || lng === undefined) {
                const rescueTeam = await RescueTeam.findOne({ where: { user_id: teamId } })
                lat = rescueTeam?.latitude ?? rescueTeam?.default_latitude
                lng = rescueTeam?.longitude ?? rescueTeam?.default_longitude
            }

            const notification = {
                type: NotificationType.CASE_STATUS_UPDATED,
                sosMesage: new SosMessageDto({
                    message: `The status of your case ${caseId} has been updated to ${newStatus} by the rescue team.`,
                    caseId: caseId,
                    teamId: teamId,
                    status: newStatus,
                    latitude: lat,
                    longitude: lng
                })
            }

            await this.sendNotificationToUser([userId], notification)
        } catch (error: any) {
            console.error('Error changing case status:', error)
            throw new Error(`Failed to change case status: ${error.message}`)
        }
    }

    public async cancelCaseByRescueTeam(
        teamId: number,
        caseId: number,
        reason: string,
        latitude?: number,
        longitude?: number
    ): Promise<void> {
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

            // Get accountn rc username

            const rescueTeam = await RescueTeam.findOne({ where: { user_id: teamId } })
            const teamname = rescueTeam?.team_name || 'Unknown Team'
            const user = await User.findOne({ where: { id: userId } })
            const username = user?.username
            const avatar = user?.avatar
            let lat = latitude
            let lng = longitude
            if (lat === undefined || lng === undefined) {
                const rescueTeam = await RescueTeam.findOne({ where: { user_id: teamId } })
                lat = rescueTeam?.latitude ?? rescueTeam?.default_latitude
                lng = rescueTeam?.longitude ?? rescueTeam?.default_longitude
            }

            const notification = {
                type: NotificationType.CASE_CANCELLED,
                sosMesage: new SosMessageDto({
                    message: `Your case ${caseId} has been marked as cancelled. Reason: ${reason}`,
                    caseId: caseId,
                    teamId: teamId,
                    userId: Number(userId),
                    userName: username,
                    latitude: lat,
                    longitude: lng,
                    cancelledReason: reason
                })
            }

            await this.sendNotificationToUser([userId], notification)

            //send SOS signal to trackers
            const trackingService = new TrackingService()
            const trackers = await trackingService.getTrackers(parseInt(userId))
            // const activeTrackers = trackers.filter((tracker) => tracker.tracking_status === true)
            if (trackers.length > 0) {
                const trackerIds = trackers.map((tracker) => tracker.user_id)
                const trackingNotification = {
                    type: NotificationType.CASE_CANCELLED,
                    sosMesage: new SosMessageDto({
                        message: `Your friend ${username}'s case ${caseId} has been marked as cancelled by the rescue team (${teamname}). Reason: ${reason}`,
                        userId: Number(userId),
                        userName: username,
                        latitude: lat,
                        longitude: lng,
                        avatar: avatar,
                        cancelledReason: reason
                    })
                }
                await this.sendNotificationToUser(trackerIds, trackingNotification)
            }
        } catch (error: any) {
            console.error('Error cancelling case:', error)
            throw new Error(`Failed to cancel case: ${error.message}`)
        }
    }

    public async completedCase(
        teamId: number,
        caseId: number,
        description: string,
        latitude?: number,
        longitude?: number
    ): Promise<void> {
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
            let lat = latitude
            let lng = longitude
            if (lat === undefined || lng === undefined) {
                const rescueTeam = await RescueTeam.findOne({ where: { user_id: teamId } })
                lat = rescueTeam?.latitude ?? rescueTeam?.default_latitude
                lng = rescueTeam?.longitude ?? rescueTeam?.default_longitude
            }

            const user = await User.findOne({ where: { id: userId } })
            const username = user?.username
            const avatar = user?.avatar
            const rescueTeam = await RescueTeam.findOne({ where: { user_id: teamId } })
            const teamname = rescueTeam?.team_name || 'Unknown Team'
            const notification = {
                type: NotificationType.CASE_COMPLETED,
                sosMesage: new SosMessageDto({
                    message: `Your case ${caseId} has been marked as completed by the rescue team (${teamname}). Description: ${description}`,
                    caseId: caseId,
                    teamId: teamId,
                    userId: Number(userId),
                    latitude: lat,
                    longitude: lng,
                    userName: username,
                    avatar: avatar,
                    completed_description: description
                })
            }
            await this.sendNotificationToUser([userId], notification)
            //send SOS signal to trackers
            const trackingService = new TrackingService()
            const trackers = await trackingService.getTrackers(parseInt(userId))
            // const activeTrackers = trackers.filter((tracker) => tracker.tracking_status === true)
            if (trackers.length > 0) {
                const trackerIds = trackers.map((tracker) => tracker.user_id)
                const trackingNotification = {
                    type: NotificationType.SOS_REQUEST,
                    sosMesage: new SosMessageDto({
                        message: `Your friend ${username}'s case ${caseId} has been marked as completed by the rescue team (${teamname}). Description: ${description}`,
                        userId: Number(userId),
                        userName: username,
                        latitude: lat,
                        longitude: lng,
                        avatar: avatar,
                        completed_description: description
                    })
                }
                await this.sendNotificationToUser(trackerIds, trackingNotification)
            }
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
                    attributes: ['id', 'username', 'email', 'phone', 'avatar', 'birthday']
                },
                {
                    model: CasesReport,
                    as: 'case'
                    // attributes: [
                    //     'id',
                    //     'status',
                    //     'created_at',
                    //     'accepted_team_id',
                    //     'cancelled_reason',
                    //     'completed_description',
                    //     'assigned_by'
                    // ]
                }
            ],
            order: [['created_at', 'DESC']]
        })
    }

    public async getAllSosRequestsForTeam(teamId: number): Promise<SosResponseDto[]> {
        console.log('Fetching SOS requests for team:', teamId)
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
    // ✅ Helper method để tìm timestamp mới nhất
    private calculateLatestTimestamp(caseDetails: any): string {
        const timestamps: dayjs.Dayjs[] = []

        // Collect all timestamps from case
        const caseData = caseDetails.case
        const caseFields = ['created_at', 'accepted_at', 'ready_at', 'completed_at', 'cancelled_at']

        caseFields.forEach((field) => {
            if (caseData[field]) {
                timestamps.push(dayjs(caseData[field]))
            }
        })

        // Collect timestamps from all SOS requests
        if (caseDetails.sosRequests && Array.isArray(caseDetails.sosRequests)) {
            caseDetails.sosRequests.forEach((sos: any) => {
                if (sos.created_at) timestamps.push(dayjs(sos.created_at))
                if (sos.updated_at) timestamps.push(dayjs(sos.updated_at))
            })
        }

        // Find the latest timestamp
        if (timestamps.length === 0) {
            console.warn('No timestamps found, using current time')
            return dayjs().tz('Asia/Ho_Chi_Minh').format()
        }

        // Sort and get the latest
        const latest = timestamps.sort((a, b) => b.valueOf() - a.valueOf())[0]
        return latest.tz('Asia/Ho_Chi_Minh').format()
    }

    public async getCaseDetailsById(caseId: string, teamId?: number): Promise<SosResponseDto | null> {
        try {
            console.log('Fetching details for case ID:', caseId)

            const sosRequests = await this.fetchSosRequests({
                case_id: caseId
            })

            if (sosRequests.length === 0) {
                console.warn(`No SOS requests found for case ID: ${caseId}`)
                return null
            }
            const caseDetails = this.mapSosRequestsToCases(sosRequests)[0]

            if (teamId) {
                const team = await RescueTeam.findOne({ where: { user_id: teamId } })
                console.log('Team found:', team)
                if (team) {
                    const teamLat = team.dataValues.default_latitude
                    const teamLng = team.dataValues.default_longitude
                    caseDetails.sosRequests = caseDetails.sosRequests.map((sos: any) => ({
                        ...sos,
                        distance_to_team: this.calculateDistance(sos.latitude, sos.longitude, teamLat, teamLng)
                    }))
                }
            }
            // console.log('Case details:', caseDetails.data.case.created_at)

            const updatedAt = this.calculateLatestTimestamp(caseDetails)
            caseDetails.case.dataValues.updated_at = updatedAt
            return caseDetails
        } catch (error: any) {
            console.error('Error fetching case details:', error)
            throw new Error(`Failed to fetch case details: ${error.message}`)
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
