import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
export interface AuthenticatedRequest extends Request {
    user?: {
        user_id: number
        device_id: string
    }
}

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access token is missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};