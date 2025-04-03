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
        } catch (error) {
            console.error('Error in register:', error)
            res.status(400).json(createResponse('error', null, error.message))
        
        }
    }

    public verifyOTP = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.verifyOTP(req.body.email, req.body.otp)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in login:', error)
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public login = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.login(req.body.email, req.body.password, req.body.device_id)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in login:', error)
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public requestOTP = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.requestOTP(req.body.email, req.body.device_id)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in requestOTP:', error)
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public verifyLoginOTP = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.verifyLoginOTP(req.body.email, req.body.otp, req.body.device_id)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in verifyLoginOTP:', error)
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public forgotPassword = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.forgotPassword(req.body.email, req.body.device_id)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in forgotPassword:', error)
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public resetPassword = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.resetPassword(req.body.email, req.body.otp, req.body.new_password)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in resetPassword:', error)
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public refreshToken = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.refreshToken(req.body.refresh_token)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in refreshToken:', error)
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public logout = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.logout(req.body.refresh_token)
            res.status(200).json(createResponse('success', result))
        } catch (error: any) {
            console.error('Error in logout:', error)
            res.status(400).json(createResponse('error', null, error.message))
        }
    }

    public debugRedis = async (req: Request, res: Response) => {
        try {
            await debugRedisKeys()
            res.status(200).json(createResponse('success', { message: 'Redis debug completed. Check console for details.' }))
        } catch (error: any) {
            console.error('Error in debugRedis:', error)
            res.status(500).json(createResponse('error', null, 'Internal server error'))
        }
    }
} 