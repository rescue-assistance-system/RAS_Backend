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
            for (const team of availableTeams) {
                const teamId = team.user_id.toString()
                const socketId = await SocketManager.getSocketId(teamId)

                const sosResponse: SosResponseDto = {
                    teamId,
                    userId,
                    latitude,
                    longitude,
                    address
                }

                try {
                    if (socketId) {
                        // Team Online
                        await SocketService.getInstance().handleSosRequest(socketId, sosResponse)
                        console.log(`SOS sent to team ${teamId} via socket`)
                    } else {
                        // Team Offline
                        await new NotificationService().handleSosRequest(sosResponse)
                        console.log(`SOS sent to team ${teamId} via FCM`)
                    }

                    notifiedTeamIds.push(teamId)
                } catch (error) {
                    console.error(`Error sending SOS to team ${teamId}:`, error)
                }
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
                const isCaseOpen = ![CaseStatus.COMPLETED, CaseStatus.CANCELLED].includes(latestCase.dataValues.status)
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
            const caseToUpdate = await CasesReport.findOne({
                where: { id: caseId }
            })

            if (!caseToUpdate) {
                throw new Error(`Case with ID ${caseId} not found`)
            }

            if (caseToUpdate.status !== CaseStatus.PENDING) {
                console.log(`Case with ID ${caseId} is not in pending status. Action not allowed.`)
                throw new Error(`Case with ID ${caseId} is not in pending status.`)
            }

            const sosList = caseToUpdate.sos_list || []
            if (sosList.length === 0) {
                console.log(`Case with ID ${caseId} has no SOS requests. Action not allowed.`)
                throw new Error(`Case with ID ${caseId} has no SOS requests.`)
            }

            await caseToUpdate.update({ status: CaseStatus.CANCELLED, cancelled_at: new Date() })
            console.log(`Case with ID ${caseId} marked as cancelled`)
            for (const sosId of sosList) {
                const sosRequest = await SosRequest.findOne({
                    where: { id: sosId }
                })

                if (sosRequest) {
                    const nearestTeamIds = sosRequest.nearest_team_ids || []
                    for (const teamId of nearestTeamIds) {
                        const socketId = await SocketManager.getSocketId(teamId.toString())

                        const notification = {
                            message: `Case ${caseId} has been marked as cancelled. The User is safe.`
                        }
                        console.log('Notification:', notification)
                        console.log(socketId, teamId.toString())
                        //Online team
                        if (socketId) {
                            await SocketService.getInstance().emitToSocket(socketId, 'case_cancelled', notification)
                            console.log(`Notification sent to team ${teamId} via socket`)
                        } else {
                            //Offline team
                            const team = await RescueTeam.findOne({
                                where: { user_id: teamId },
                                include: [
                                    {
                                        model: User,
                                        as: 'user',
                                        attributes: ['id', 'fcm_token']
                                    }
                                ]
                            })
                            if (team?.user?.dataValues?.fcm_token) {
                                console.log(`Sending notification to team ${teamId} via FCM`)
                                await new NotificationService().sendNotification(teamId, {
                                    type: 'case_cancelled',
                                    message: `Case ${caseId} has been marked as cancelled. The user is safe.`
                                })
                                console.log(`Notification sent to team ${teamId} via FCM`)
                            }
                        }
                    }
                } else {
                    console.error(`SOS request with ID ${sosId} not found`)
                }
            }
        } catch (error: any) {
            console.error('Error marking case as completed:', error)
            throw new Error(`Failed to mark case as completed: ${error.message}`)
        }
    }
}
