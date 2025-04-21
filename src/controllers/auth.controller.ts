import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { debugRedisKeys } from '../utils/otp.utils'
import { createResponse } from '../utils/response.utils'

export class AuthController {
    private authService: AuthService

    constructor() {
        this.authService = new AuthService()
    }

    public register = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.register(req.body)
            res.status(201).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in register:', error.message)

            if (error.message === 'User with this email already exists') {
                res.status(400).json(createResponse('error', null, error.message))
            } else {
                res.status(500).json(createResponse('error', null, 'Internal server error'))
            }
        }
    }

    public verifyOTP = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.verifyOTP(req.body.email, req.body.otp)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in verifyOTP:', error.message)

            if (error.message === 'User not found') {
                res.status(404).json(createResponse('error', null, error.message))
            } else if (error.message === 'Invalid or expired OTP') {
                res.status(400).json(createResponse('error', null, error.message))
            } else {
                res.status(500).json(createResponse('error', null, 'Internal server error'))
            }
        }
    }

    public login = async (req: Request, res: Response) => {
        const { email, password, device_id, fcm_token } = req.body
        try {
            const result = await this.authService.login(email, password, device_id, fcm_token)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in login:', error.message)

            if (error.message === 'User not found') {
                res.status(404).json(createResponse('error', null, error.message))
            } else if (error.message === 'Password does not match') {
                res.status(400).json(createResponse('error', null, error.message))
            } else if (
                error.message ===
                'This account is already linked to another device. Please send RequestOTP to verify the new device.'
            ) {
                res.status(403).json(createResponse('error', null, error.message))
            } else if (error.message === 'This device is already linked to another account.') {
                res.status(403).json(createResponse('error', null, error.message))
            } else {
                res.status(500).json(createResponse('error', null, 'Internal server error'))
            }
        }
    }

    public requestOTP = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.requestOTP(req.body.email, req.body.device_id)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in requestOTP:', error.message)
            if (error.message === 'User not found') {
                res.status(404).json(createResponse('error', null, error.message))
            } else if (error.message === 'Device mismatch') {
                res.status(400).json(createResponse('error', null, error.message))
            } else {
                res.status(500).json(createResponse('error', null, 'Internal server error'))
            }
        }
    }

    public verifyLoginOTP = async (req: Request, res: Response) => {
        try {
            const { email, otp, device_id, fcm_token } = req.body
            const result = await this.authService.verifyLoginOTP(email, otp, device_id, fcm_token)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in verifyLoginOTP:', error.message)

            if (error.message === 'User not found') {
                res.status(404).json(createResponse('error', null, error.message))
            } else if (error.message === 'Invalid or expired OTP') {
                res.status(400).json(createResponse('error', null, error.message))
            } else if (error.message === 'Device mismatch') {
                res.status(403).json(createResponse('error', null, error.message))
            } else {
                res.status(500).json(createResponse('error', null, 'Internal server error'))
            }
        }
    }

    public forgotPassword = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.forgotPassword(req.body.email, req.body.device_id)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in forgotPassword:', error.message)

            if (error.message === 'User not found') {
                res.status(404).json(createResponse('error', null, error.message))
            } else if (error.message === 'Device mismatch') {
                res.status(403).json(createResponse('error', null, error.message))
            } else {
                res.status(500).json(createResponse('error', null, 'Internal server error'))
            }
        }
    }

    public resetPassword = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.resetPassword(req.body.email, req.body.otp, req.body.new_password)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in resetPassword:', error.message)

            if (error.message === 'User not found') {
                res.status(404).json(createResponse('error', null, error.message))
            } else if (error.message === 'Invalid or expired OTP') {
                res.status(400).json(createResponse('error', null, error.message))
            } else {
                res.status(500).json(createResponse('error', null, 'Internal server error'))
            }
        }
    }

    public refreshToken = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.refreshToken(req.body.refresh_token)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in refreshToken:', error.message)

            if (error.message === 'Invalid refresh token') {
                res.status(400).json(createResponse('error', null, error.message))
            } else {
                res.status(500).json(createResponse('error', null, 'Internal server error'))
            }
        }
    }

    public logout = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.logout(req.body.refresh_token)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in logout:', error.message)

            if (error.message === 'Invalid refresh token') {
                res.status(400).json(createResponse('error', null, error.message))
            } else {
                res.status(500).json(createResponse('error', null, 'Internal server error'))
            }
        }
    }

    public debugRedis = async (req: Request, res: Response) => {
        try {
            await debugRedisKeys()
            res.status(200).json(
                createResponse('success', { message: 'Redis debug completed. Check console for details.' })
            )
        } catch (error: any) {
            console.error('Error in debugRedis:', error)
            res.status(500).json(createResponse('error', null, 'Internal server error'))
        }
    }

    public getUserFCMToken = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.user_id
            if (!userId) {
                return res.status(400).json(createResponse('error', null, 'User ID is required'))
            }
            const fcmToken = await this.authService.getUserFromToken(userId)
            res.status(200).json(createResponse('success', { fcmToken }))
        } catch (error: any) {
            console.error('Error in getUserFCMToken:', error.message)
            res.status(500).json(createResponse('error', null, 'Internal server error'))
        }
    }
}
