import { handleApiError } from '~/middleware/ErrorHandler'
import { MessagingService } from '~/services/messagingService'
import { createResponse } from '~/utils/response.utils'

export class MessagingController {
    private readonly messagingService: MessagingService

    constructor() {
        this.messagingService = new MessagingService()
    }

    public async sendMessage(req, res) {
        try {
            const { content, contentType, caseId } = req.body
            const { user_id, role } = req.user

            if (!user_id || !role || !content || !contentType || !caseId) {
                return res.status(400).json({ message: 'Missing required fields' })
            }

            const messageDTO = await this.messagingService.sendMessage(user_id, content, contentType, caseId, role)
            return res.status(200).json(createResponse('success', messageDTO))
        } catch (error) {
            console.error('Error sending message:', error)
            return handleApiError(res, error, 'Error sending message:')
        }
    }
}
