import { handleApiError } from '~/middleware/ErrorHandler'
import { CallService } from '~/services/call.service'
import { Request, Response } from 'express'

export class CallController {
    private callService: CallService
    constructor() {
        this.callService = new CallService()
    }

    public receivedCall = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.user_id
            const { friendId, name, avatar, type } = req.body
            if (!userId || !friendId || !type) {
                return res.status(400).json({ status: 'error', message: 'Missing required fields' })
            }

            const isSuccessful = await this.callService.receivedCall(userId.toString(), friendId, name, avatar, type)
            if (isSuccessful) {
                return res.status(200).json({ status: 'success', message: 'Call received successfully' })
            } else {
                return res.status(400).json({ status: 'error', message: 'User is offline' })
            }
        } catch (error: any) {
            return handleApiError(res, error, 'Error getting your following:')
        }
    }
}
