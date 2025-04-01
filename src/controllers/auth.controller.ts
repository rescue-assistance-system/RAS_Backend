import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { debugRedisKeys } from '../utils/otp.utils'

export class AuthController {
    private authService: AuthService

    constructor() {
        this.authService = new AuthService()
    }

    public register = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.register(req.body)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    public verifyOTP = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.verifyOTP(req.body.email, req.body.otp)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    public login = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.login(req.body.email, req.body.password, req.body.device_id)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    public requestOTP = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.requestOTP(req.body.email, req.body.device_id)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    public verifyLoginOTP = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.verifyLoginOTP(req.body.email, req.body.otp, req.body.device_id)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    public forgotPassword = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.forgotPassword(req.body.email)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    public resetPassword = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.resetPassword(req.body.email, req.body.otp, req.body.new_password)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    public refreshToken = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.refreshToken(req.body.refresh_token)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    public logout = async (req: Request, res: Response) => {
        try {
            const result = await this.authService.logout(req.body.refresh_token)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }

    public debugRedis = async (req: Request, res: Response) => {
        try {
            await debugRedisKeys();
            res.json({ message: 'Redis debug completed. Check console for details.' });
        } catch (error) {
            console.error('Error in debugRedis:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
} 