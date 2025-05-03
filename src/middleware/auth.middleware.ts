import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import CasesReport from '~/database/models/case_report.model'
export interface AuthenticatedRequest extends Request {
    user?: {
        user_id: number
        device_id: string
    }
}
import { verifyAccessToken } from '../utils/jwt.utils'

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({ message: 'Access token is missing' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' })
    }
}
export const authorize = (requiredRoles: string[]) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            if (!token) {
                return res.status(401).json({ message: 'Unauthorized' })
            }

            const payload = verifyAccessToken(token)
            if (!requiredRoles.includes(payload.role)) {
                return res.status(403).json({
                    message: 'Forbidden: Insufficient role',
                    requiredRoles: requiredRoles,
                    yourRole: payload.role
                })
            }
            req.user = payload
            next()
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
    }
}

export const authorizeCaseOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.user_id
        const { caseId } = req.body
        console.log('User ID:', userId)
        console.log('Case ID:', caseId)

        if (!caseId) {
            return res.status(400).json({ error: 'Case ID is required.' })
        }

        const caseToCheck = await CasesReport.findOne({ where: { id: caseId } })

        if (!caseToCheck) {
            return res.status(404).json({ error: `Case with ID ${caseId} not found.` })
        }
        console.log(caseToCheck.dataValues.from_id)

        if (caseToCheck.dataValues.from_id !== userId) {
            return res.status(403).json({ error: `You are not authorized to perform actions on case ${caseId}.` })
        }

        next()
    } catch (error: any) {
        console.error('Authorization error:', error)
        res.status(500).json({ error: 'Failed to authorize case ownership.' })
    }
}
