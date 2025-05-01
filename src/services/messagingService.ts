import { User } from '~/database'
import CasesReport from '~/database/models/case_report.model'
import Message from '~/database/models/message.model'
import { convertToDTO as convertToMessageDTO, MessageDTO } from '~/dtos/messageDTO'
import { SocketService } from '~/sockets/SocketService'
import { NotificationService } from './notification.service'
import SosRequest from '~/database/models/sos.model'
import { Role } from '~/enums/Role'

export class MessagingService {
    async sendMessage(
        fromId: number,
        content: string,
        contentType: string,
        caseId: number,
        fromRole: string
    ): Promise<MessageDTO> {
        const senderName = await this.getSenderName(fromId)
        const message = await Message.create({
            from_id: fromId,
            content,
            contentType,
            case_id: caseId,
            sender_name: senderName,
            created_at: new Date()
        })

        const messageDTO = convertToMessageDTO(message.dataValues)

        if (fromRole === Role.RESCUE_TEAM) {
            const userIds = await this.getAllUserAndOtherTeamInCase(caseId, fromId)
            console.log('List user receive message: ', userIds)
            if (!userIds || userIds.length === 0) {
                throw new Error('User ID not found in case')
            }

            this.sendMessageToUser(messageDTO, userIds)
        } else if (fromRole === 'user') {
            const rescueTeams = await this.getRescueTeamInCase(caseId)
            if (rescueTeams.length === 0) {
                throw new Error('No rescue teams found in case')
            }

            this.sendMessageToUser(messageDTO, rescueTeams)
        }

        return messageDTO
    }

    async getSenderName(fromId: number): Promise<string | null> {
        const user = await User.findOne({ attributes: ['username'], where: { id: fromId } })
        return user ? user.dataValues.username : null
    }

    // Function to check if the user is online and send the message via Socket.IO or FCM
    async sendMessageToUser(message: MessageDTO, toIds: string[]) {
        if (!toIds || toIds.length === 0) {
            throw new Error('No user IDs provided')
        }

        const onlineUsers = await SocketService.getInstance().getListOnlineUsers(toIds)
        SocketService.getInstance().sendMessage(message, onlineUsers)
        console.log(`Users online: ${onlineUsers.join(', ')}`)

        const offlineUsers = toIds.filter((userId) => !onlineUsers.includes(userId))
        if (offlineUsers.length > 0) {
            new NotificationService().sendMessage(message, offlineUsers)
            console.log(`Users offline: ${offlineUsers.join(', ')}`)
        }
    }

    async getRescueTeamInCase(caseId: number): Promise<string[]> {
        // Check if the case accepted by a team
        const caseReport = await CasesReport.findOne({
            attributes: ['accepted_team_id'],
            where: { id: caseId }
        })
        if (!caseReport) {
            throw new Error('Case not found')
        }
        const acceptedTeamId = caseReport.dataValues.accepted_team_id
        if (acceptedTeamId) {
            return [acceptedTeamId.toString()]
        }

        // If the case is not accepted by a team, send it to all nearest teams
        const sosRequest = await CasesReport.findOne({
            attributes: ['sos_list'],
            where: { id: caseId }
        })

        const sosList = sosRequest?.dataValues.sos_list
        if (!sosList || sosList.length === 0) {
            throw new Error('No SOS requests found for this case')
        }

        const lastSosRequestId = sosList[sosList.length - 1]
        const lastSosRequest = await SosRequest.findOne({
            attributes: ['nearest_team_ids'],
            where: { id: lastSosRequestId }
        })
        if (lastSosRequest && lastSosRequest.dataValues.nearest_team_ids) {
            return lastSosRequest.dataValues.nearest_team_ids.map((teamId: number) => teamId.toString())
        }
        throw new Error('No nearest team IDs found for this SOS request')
    }

    async getUserIdInCase(caseId: number): Promise<number | null> {
        return await CasesReport.findOne({
            attributes: ['from_id'],
            where: { id: caseId }
        }).then((caseReport) => {
            if (caseReport) {
                return caseReport.dataValues.from_id
            } else {
                return null
            }
        })
    }

    async getAllUserAndOtherTeamInCase(caseId: number, senderId: number): Promise<string[]> {
        const userId = await this.getUserIdInCase(caseId)
        if (!userId) {
            throw new Error('User ID not found in case')
        }
        const rescueTeams = (await this.getRescueTeamInCase(caseId)).filter((teamId) => teamId !== senderId.toString())
        const allUserAndOtherTeam = [userId.toString(), ...rescueTeams]
        return allUserAndOtherTeam
    }
}
