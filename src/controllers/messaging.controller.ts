import { Role } from '../enums/Role'
import { handleApiError } from '~/middleware/ErrorHandler'
import { MessagingService } from '~/services/messaging.service'
import { createResponse } from '~/utils/response.utils'

export class MessagingController {
    private readonly messagingService: MessagingService

    constructor() {
        this.messagingService = new MessagingService()
    }

    public async sendMessage(req, res) {
        try {
            const { content, content_type, caseId, duration } = req.body
            const { user_id, role } = req.user

            if (!user_id || !role || !content || !content_type || !caseId) {
                return res.status(400).json({ message: 'Missing required fields' })
            }

            const messageDTO = await this.messagingService.sendMessage(
                user_id,
                content,
                content_type,
                caseId,
                role,
                duration
            )
            return res.status(200).json(createResponse('success', messageDTO))
        } catch (error) {
            console.error('Error sending message:', error)
            return handleApiError(res, error, 'Error sending message:')
        }
    }

    public async getConversation(req, res) {
        try {
            const { caseId, page, limit } = req.query
            const { user_id, role } = req.user

            if (!user_id || !role || !caseId || !page || !limit) {
                return res.status(400).json({ message: 'Missing required fields' })
            }

            const messages = await this.messagingService.getConversation(
                Number(user_id),
                role,
                Number(caseId),
                Number(page),
                Number(limit)
            )
            return res.status(200).json(createResponse('success', messages))
        } catch (error: any) {
            console.error('Error getting conversation:', error)
            if (error.message === 'PERMISSION_DENIED') {
                return res.status(403).json({ message: 'User does not have permission to access this conversation' })
            }
            return handleApiError(res, error, 'Error getting conversation:')
        }
    }

    public async getListConversationsByUser(req, res) {
        try {
            const { page, limit } = req.query
            const { user_id, role } = req.user

            if (!user_id || !page || !limit) {
                return res.status(400).json({ message: 'Missing required fields' })
            }

            if (role !== Role.USER) {
                return res.status(403).json({ message: 'User does not have permission to access this conversation' })
            }

            const conversations = await this.messagingService.getListConversationsByUser(
                Number(user_id),
                Number(page),
                Number(limit)
            )
            return res.status(200).json(createResponse('success', conversations))
        } catch (error) {
            console.error('Error getting list conversations:', error)
            return handleApiError(res, error, 'Error getting list conversations:')
        }
    }

    public async getListConversationsByRescueTeam(req, res) {
        try {
            const { page, limit } = req.query
            const { user_id, role } = req.user

            if (!user_id || !page || !limit) {
                return res.status(400).json({ message: 'Missing required fields' })
            }

            if (role !== Role.RESCUE_TEAM) {
                return res.status(403).json({ message: 'User does not have permission to access this conversation' })
            }

            const conversations = await this.messagingService.getListConversationsByRescueTeam(
                Number(user_id),
                Number(page),
                Number(limit)
            )
            return res.status(200).json(createResponse('success', conversations))
        } catch (error) {
            console.error('Error getting list conversations:', error)
            return handleApiError(res, error, 'Error getting list conversations:')
        }
    }
}
