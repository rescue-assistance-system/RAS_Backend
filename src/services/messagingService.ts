import { sequelize, User } from '~/database'
import CasesReport from '~/database/models/case_report.model'
import Message from '~/database/models/message.model'
import { convertToDTO as convertToMessageDTO, MessageDTO } from '~/dtos/messageDTO'
import { SocketService } from '~/sockets/SocketService'
import { NotificationService } from './notification.service'
import SosRequest from '~/database/models/sos.model'
import { Role } from '../enums/role'
import { ConversationPaging, Paging } from '~/dtos/paging'
import { Op } from 'sequelize'

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

    async getConversation(
        userId: number,
        role: string,
        caseId: number,
        page: number,
        limit: number
    ): Promise<Paging<MessageDTO> | null> {
        const accessable = await this.canAccessConversation(caseId, userId, role)
        if (!accessable) {
            throw new Error('PERMISSION_DENIED')
        }

        const offset = (page - 1) * limit
        const messages = await Message.findAll({
            where: { case_id: caseId },
            limit: limit,
            offset: offset,
            order: [['created_at', 'DESC']]
        })
        if (!messages || messages.length === 0) {
            return null
        }

        const totalItems = await Message.count({ where: { case_id: caseId } })
        const content = messages.map((message) => convertToMessageDTO(message.dataValues))
        return new Paging<MessageDTO>(content, totalItems, page, limit)
    }

    async getListConversationsByUser(
        userId: number,
        page: number,
        limit: number
    ): Promise<ConversationPaging<MessageDTO> | null> {
        const cases = await CasesReport.findAll({
            where: { from_id: userId },
            attributes: ['id']
        })
        if (!cases || cases.length === 0) {
            return null
        }

        const caseIds = cases.map((caseReport) => caseReport.dataValues.id)
        const totalItems = caseIds.length
        const offset = (page - 1) * limit
        const messages = await sequelize.query(
            `
            SELECT m.*
            FROM messages m
            INNER JOIN (
                SELECT case_id, MAX(created_at) AS max_created_at
                FROM messages
                WHERE case_id IN (:caseIds)
                GROUP BY case_id
            ) latest
            ON m.case_id = latest.case_id AND m.created_at = latest.max_created_at
            ORDER BY m.created_at DESC
            LIMIT :limit OFFSET :offset
            `,
            {
                replacements: {
                    caseIds,
                    limit,
                    offset
                },
                model: Message,
                mapToModel: true
            }
        )
        if (!messages || messages.length === 0) {
            return null
        }
        const content = messages.map((message) => convertToMessageDTO(message.dataValues))
        return new ConversationPaging<MessageDTO>(content, totalItems, page, limit)
    }

    async getListConversationsByRescueTeam(
        rescueTeamId: number,
        page: number,
        limit: number
    ): Promise<ConversationPaging<MessageDTO> | null> {
        const offset = (page - 1) * limit

        const cases = await CasesReport.findAll({
            where: { accepted_team_id: rescueTeamId },
            attributes: ['id']
        })

        if (!cases || cases.length === 0) {
            return null
        }

        const caseIds = cases.map((caseReport) => caseReport.dataValues.id)
        const totalItems = caseIds.length
        const messages = await sequelize.query(
            `
            SELECT m.*
            FROM messages m
            INNER JOIN (
                SELECT case_id, MAX(created_at) AS max_created_at
                FROM messages
                WHERE case_id IN (:caseIds)
                GROUP BY case_id
            ) latest
            ON m.case_id = latest.case_id AND m.created_at = latest.max_created_at
            ORDER BY m.created_at DESC
            LIMIT :limit OFFSET :offset
            `,
            {
                replacements: {
                    caseIds,
                    limit,
                    offset
                },
                model: Message,
                mapToModel: true
            }
        )

        if (!messages || messages.length === 0) {
            return null
        }

        const content = messages.map((message) => convertToMessageDTO(message.dataValues))
        return new ConversationPaging<MessageDTO>(content, totalItems, page, limit)
    }

    async canAccessConversation(caseId: number, userId: number, role: string): Promise<boolean> {
        console.log('User ID:', userId)
        if (role === Role.RESCUE_TEAM) {
            const authorRC = await this.getRescueTeamInCase(caseId)
            console.log('Rescue team IDs:', authorRC)
            if (authorRC.includes(userId.toString())) {
                return true
            }
        } else if (role === Role.USER) {
            const authorUser = await this.getUserIdInCase(caseId)
            if (authorUser && authorUser === userId) {
                return true
            }
        }
        return false
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
        // Check if the case'status is 'accepted' and get the accepted team ID
        const acceptedCaseReport = await CasesReport.findOne({
            attributes: ['accepted_team_id'],
            where: {
                id: caseId
            }
        })

        const acceptedTeamId = acceptedCaseReport?.dataValues.accepted_team_id
        if (acceptedTeamId) {
            console.log('Accepted team ID:', acceptedTeamId)
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
