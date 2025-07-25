import { sequelize, User } from '~/database'
import CasesReport from '~/database/models/case_report.model'
import Message from '~/database/models/message.model'
import { convertToDTO as convertToMessageDTO, MessageDTO, MessageInfoDTO } from '~/dtos/messageDTO'
import { SocketService } from '~/sockets/SocketService'
import { NotificationService } from './notification.service'
import SosRequest from '~/database/models/sos.model'
import { Role } from '../enums/Role'
import { ConversationPaging, Paging } from '~/dtos/paging'
import { QueryTypes } from 'sequelize'

export class MessagingService {
    async sendMessage(
        fromId: number,
        content: string,
        content_type: string,
        caseId: number,
        fromRole: string,
        duration: number
    ): Promise<MessageDTO> {
        const senderInfo = await this.getSenderInfo(fromId)
        const message = await Message.create({
            from_id: fromId,
            content,
            content_type,
            case_id: caseId,
            sender_name: senderInfo?.username || null,
            sender_avatar: senderInfo?.avatar || null,
            created_at: new Date(),
            duration: duration ?? null
        })

        const messageWithSender = {
            ...message.dataValues,
            sender: {
                id: senderInfo?.id,
                username: senderInfo?.username,
                avatar: senderInfo?.avatar
            }
        }

        const messageDTO = convertToMessageDTO(messageWithSender)
        console.log('Message DTO:', messageDTO)
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

    async getConvoInforByUser(caseId: number): Promise<MessageInfoDTO> {
        const result = await sequelize.query(
            `
            SELECT 
                c.id AS caseid,
                u.username AS username, 
                u.avatar AS avatar, 
                u.id AS userid
            FROM cases_report c
            LEFT JOIN accounts_ras_sys u ON c.accepted_team_id = u.id
            WHERE c.id = :caseId
            `,
            {
                replacements: { caseId },
                type: QueryTypes.SELECT
            }
        )
        console.log('Result:', result)

        const raw = result[0]

        if (!raw) {
            throw new Error(`No case found for id ${caseId}`)
        }

        return new MessageInfoDTO({
            caseId: raw.caseid,
            userId: raw.userid,
            avatar: raw.avatar,
            userName: raw.username
        })
    }

    async getConvoInforByRescueTeam(caseId: number): Promise<MessageInfoDTO> {
        const result = await sequelize.query(
            `
            SELECT 
                c.id AS caseid,
                u.username AS username, 
                u.avatar AS avatar, 
                u.id AS userid
            FROM cases_report c
            LEFT JOIN accounts_ras_sys u ON c.from_id = u.id
            WHERE c.id = :caseId
            `,
            {
                replacements: { caseId },
                type: QueryTypes.SELECT
            }
        )

        const raw = result[0]

        if (!raw) {
            throw new Error(`No case found for id ${caseId}`)
        }

        return new MessageInfoDTO({
            caseId: raw.caseid,
            userId: raw.userid,
            avatar: raw.avatar,
            userName: raw.username
        })
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
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['avatar', 'username', 'id']
                }
            ]
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
            attributes: ['id', 'accepted_team_id']
        })
        if (!cases || cases.length === 0) {
            return null
        }

        // Create map or set caseIds and acceptedTeamIds to avoid duplicates
        const caseIds: number[] = []
        const acceptedTeamIds = []

        cases.forEach((caseReport) => {
            const { id, accepted_team_id } = caseReport.dataValues
            caseIds.push(id)
            acceptedTeamIds.push(accepted_team_id)
        })

        const totalItems = caseIds.length
        const offset = (page - 1) * limit
        const messages = await sequelize.query(
            `
            SELECT m.*, u.username AS sender_name, u.avatar AS avatar, u.id AS sender_id
            FROM messages m
            INNER JOIN (
                SELECT case_id, MAX(created_at) AS max_created_at
                FROM messages
                WHERE case_id IN (:caseIds)
                GROUP BY case_id
            ) latest
            ON m.case_id = latest.case_id AND m.created_at = latest.max_created_at
            INNER JOIN cases_report c ON m.case_id = c.id
            LEFT JOIN accounts_ras_sys u ON c.accepted_team_id = u.id
            ORDER BY m.created_at DESC
            LIMIT :limit OFFSET :offset
            `,
            {
                replacements: {
                    caseIds,
                    limit,
                    offset
                },
                type: QueryTypes.SELECT // Important: Don't use model: Message when adding custom fields
            }
        )

        if (!messages || messages.length === 0) {
            return null
        }
        const content = messages.map((message) => {
            return convertToMessageDTO(message)
        })
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
            SELECT m.*, u.username AS sender_name, u.avatar AS avatar, u.id AS sender_id
            FROM messages m
            INNER JOIN (
                SELECT case_id, MAX(created_at) AS max_created_at
                FROM messages
                WHERE case_id IN (:caseIds)
                GROUP BY case_id
            ) latest
            ON m.case_id = latest.case_id AND m.created_at = latest.max_created_at
            INNER JOIN cases_report c ON m.case_id = c.id
            LEFT JOIN accounts_ras_sys u ON c.from_id = u.id
            ORDER BY m.created_at DESC
            LIMIT :limit OFFSET :offset
            `,
            {
                replacements: {
                    caseIds,
                    limit,
                    offset
                },
                type: QueryTypes.SELECT // Important: Don't use model: Message when adding custom fields
            }
        )

        if (!messages || messages.length === 0) {
            return null
        }

        const content = messages.map((message) => {
            return convertToMessageDTO(message)
        })
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
        const user = await User.findOne({ attributes: ['username', 'avatar'], where: { id: fromId } })
        return user ? user.dataValues.username : null
    }

    async getSenderInfo(fromId: number): Promise<{ id: number; avatar: string | null; username: string } | null> {
        const user = await User.findOne({
            attributes: ['id', 'username', 'avatar'],
            where: { id: fromId }
        })

        if (!user) return null

        return {
            id: user.id,
            username: user.username,
            avatar: user.avatar
        }
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
