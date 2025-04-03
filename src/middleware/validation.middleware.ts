import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

export const validateRegister = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    // body('phone').notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('device_id').notEmpty().withMessage('Device ID is required'),
    validateRequest
]

export const validateVerifyOTP = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    validateRequest
]

export const validateLogin = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    body('device_id').notEmpty().withMessage('Device ID is required'),
    validateRequest
]

export const validateRequestOTP = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('device_id').notEmpty().withMessage('Device ID is required'),
    validateRequest
]

export const validateVerifyLoginOTP = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('device_id').notEmpty().withMessage('Device ID is required'),
    validateRequest
]

export const validateForgotPassword = [body('email').isEmail().withMessage('Invalid email format'), validateRequest]

export const validateResetPassword = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest
]

export const validateRefreshToken = [
    body('refresh_token').notEmpty().withMessage('Refresh token is required'),
    validateRequest
]

export const validateLogout = [
    body('refresh_token').notEmpty().withMessage('Refresh token is required'),
    validateRequest
]
