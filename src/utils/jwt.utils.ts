import jwt from 'jsonwebtoken'
import { Request } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'

export interface JWTPayload {
    user_id: number
    device_id: string
}

export const generateAccessToken = (payload: JWTPayload): string => {
    console.log(payload.user_id, payload.device_id);
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

export const generateRefreshToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export const verifyAccessToken = (token: string): JWTPayload => {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export const verifyRefreshToken = (token: string): JWTPayload => {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
}

export const extractTokenFromHeader = (req: Request): string | null => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
    }
    return authHeader.split(' ')[1]
}
