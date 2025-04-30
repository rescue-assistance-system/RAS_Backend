import User from '~/database/models/user.model'
import RescueTeam from '~/database/models/rescue_team.model'
import { SocketService } from '~/sockets/SocketService'
import { NotificationService } from '~/services/notification.service'
import { SocketManager } from '~/sockets/SocketManager'
import { SosRequestDto, SosResponseDto } from '~/dtos/sos-request.dto'
import CasesReport from '~/database/models/case_report.model'
import SosRequest from '~/database/models/sos.model'

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

    public async sendSosRequest(data: SosRequestDto): Promise<string[]> {
        try {
            const { userId, latitude, longitude } = data
            const radii = [5, 10, 20]
            let availableTeams: any[] = []
            //find rescue teams in radius
            for (const radius of radii) {
                availableTeams = await this.findAvailableTeams(latitude, longitude, radius)
                console.log('Radius:', radius, 'Available teams:', availableTeams)
                if (availableTeams.length > 0) break
            }
            console.log('radius:', radii)
            // console.log('Available teams:', availableTeams);

            if (availableTeams.length === 0) {
                throw new Error('No available rescue teams found')
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
                    longitude
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

            const nearestTeamIds = notifiedTeamIds.map((id) => {
                const teamIdNum = parseInt(id)
                if (isNaN(teamIdNum)) {
                    throw new Error(`Invalid teamId: ${id}`)
                }
                return teamIdNum
            })

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
            const ONE_HOUR_MS = 60 * 60 * 1000 // 1 hour

            if (latestCase) {
                // CHeck status of case
                const isCaseOpen = !['completed', 'cancelled'].includes(latestCase.dataValues.status)
                console.log('Latest case status:', latestCase.dataValues.status)
                // Check if the latest case is within the time limit
                let isWithinTimeLimit = false
                if (isCaseOpen && latestCase.dataValues.sos_list && latestCase.dataValues.sos_list.length > 0) {
                    // get last SOS ID from sos_list
                    const lastSosId = Math.max(...latestCase.dataValues.sos_list)
                    const lastSos = await SosRequest.findOne({
                        where: { id: lastSosId }
                    })

                    if (lastSos && lastSos.created_at) {
                        const createdAtLocal = new Date(lastSos.created_at).getTime() + 7 * 60 * 60 * 1000 // Change to UTC+7 (Vietnam timezone)
                        const timeDiff = Date.now() - createdAtLocal
                        isWithinTimeLimit = timeDiff <= ONE_HOUR_MS
                    } else {
                        console.error('Last SOS or created_at is invalid')
                    }
                }

                // Check if the latest case is open and within the time limit
                if (isCaseOpen && isWithinTimeLimit) {
                    caseToUse = latestCase
                } else {
                    caseToUse = await CasesReport.create({
                        status: 'pending',
                        from_id: userIdNum,
                        sos_list: []
                    })
                }
            } else {
                caseToUse = await CasesReport.create({
                    status: 'pending',
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

    private async findAvailableTeams(latitude: number, longitude: number, radius: number): Promise<any[]> {
        try {
            const teams = await RescueTeam.findAll({
                where: {
                    status: 'available'
                    // is_active: true
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        where: {
                            role: 'rescue_team'
                        },
                        attributes: ['id', 'fcm_token']
                    }
                ]
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
}
