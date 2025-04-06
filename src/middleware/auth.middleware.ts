import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt.utils'

export interface AuthenticatedRequest extends Request {
    user?: {
        user_id: number
        device_id: string
    }
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = extractTokenFromHeader(req)
        if (!token) {
            return res.status(401).json({ error: 'No token provided' })
        }

        const payload = verifyAccessToken(token)
        req.user = payload
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' })
    }
}
