import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import User from '../database/models/user.model'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils'
import { generateOTP, storeOTP, verifyOTP, clearOTP, getOTPExpiry } from '../utils/otp.utils'
import redisClient from '../configs/redis.config'
import {
    sendEmail,
    generateOTPVerifyDevice,
    generateOTPEmailContent,
    generateOTPForgotPassword
} from '../configs/email.config'

export class AuthService {
    async register(userData: { username: string; email: string; password: string }) {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email: userData.email }]
            }
        })

        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10)
        const otp = generateOTP()

        const tempUserKey = `temp_user:${userData.email}`
        redisClient.set(
            tempUserKey,
            JSON.stringify({
                ...userData,
                password: hashedPassword
            }),
            { EX: getOTPExpiry() }
        )

        const htmlContent = generateOTPEmailContent(otp)
        const emailSent = await sendEmail(userData.email, 'Your OTP Code for RAS Registration', htmlContent)
        if (!emailSent) {
            throw new Error('Failed to send registration OTP email')
        }
        storeOTP(userData.email, otp)
        return {
            ...userData,
            password: hashedPassword
        }
    }

    async verifyOTP(email: string, otp: string) {
        try {
            const isValid = await verifyOTP(email, otp)
            if (!isValid) {
                throw new Error('Invalid or expired OTP')
            }
            const tempUserKey = `temp_user:${email}`
            const tempUserData = await redisClient.get(tempUserKey)

            if (!tempUserData) {
                throw new Error('Registration data expired. Please register again.')
            }

            const userData = JSON.parse(tempUserData)
            const user = User.build(userData)
            await user.save()
            console.log('User created successfully:', user)

            redisClient.del(tempUserKey)
            clearOTP(email)

            return {
                message: 'Account verified successfully'
            }
        } catch (error) {
            console.error('Error in verifyOTP:', error)
            throw error
        }
    }

    async login(email: string, password: string, device_id: string) {
        const user = await User.findOne({
            where: { email }
        })

        if (!user) {
            throw new Error('User not found')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new Error('Password does not match')
        }

        if (user.device_id && user.device_id !== device_id) {
            throw new Error(
                'This account is already linked to another device. Please log out from the other device first.'
            )
        }
        user.device_id = device_id
        await user.save()

        const tokens = {
            access_token: generateAccessToken({
                user_id: user.id,
                device_id: user.device_id
            }),
            refresh_token: generateRefreshToken({
                user_id: user.id,
                device_id: user.device_id
            })
        }

        return tokens
    }
    async requestOTP(email: string, device_id: string) {
        const user = await User.findOne({
            where: { email }
        })

        if (!user) {
            throw new Error('User not found')
        }
        const otp = generateOTP()
        const tempUserKey = `otp:${email}`
        await redisClient.set(
            tempUserKey,
            JSON.stringify({
                otp,
                device_id
            }),
            { EX: getOTPExpiry() }
        )

        const htmlContent = generateOTPVerifyDevice(otp)
        const emailSent = await sendEmail(email, 'Verify Your Device - RAS', htmlContent)
        if (!emailSent) {
            throw new Error('Failed to send OTP email')
        }
        console.log(`OTP for ${email}: ${otp}`)

        return {
            message: 'New device detected. OTP sent to your email.',
            otp_expires_in: getOTPExpiry()
        }
    }

    async verifyLoginOTP(email: string, otp: string, device_id: string) {
        try {
            const tempUserKey = `otp:${email}`
            const storedData = await redisClient.get(tempUserKey)

            if (!storedData) {
                throw new Error('OTP expired or not found')
            }

            const { otp: storedOTP, device_id: storedDeviceId } = JSON.parse(storedData)

            if (storedOTP !== otp) {
                throw new Error('Invalid OTP')
            }

            if (storedDeviceId !== device_id) {
                throw new Error('Device mismatch. OTP was requested from a different device.')
            }

            const user = await User.findOne({
                where: { email }
            })

            if (!user) {
                throw new Error('User not found')
            }

            user.device_id = device_id
            await user.save()

            await redisClient.del(tempUserKey)

            const tokens = {
                access_token: generateAccessToken({
                    user_id: user.dataValues.id,
                    device_id: user.dataValues.device_id
                }),
                refresh_token: generateRefreshToken({
                    user_id: user.dataValues.id,
                    device_id: user.dataValues.device_id
                })
            }

            return {
                message: 'Login verified successfully',
                ...tokens
            }
        } catch (error) {
            console.error('Error in verifyLoginOTP:', error)
            throw error
        }
    }
    async forgotPassword(email: string, device_id: string) {
        const user = await User.findOne({
            where: { email }
        })

        if (!user) {
            throw new Error('User not found')
        }
        console.log('user.device_id', user.device_id)
        console.log('device_id', device_id)
        // Kiểm tra device_id
        if (user.device_id !== device_id) {
            throw new Error('Device ID mismatch. Please use the registered device.')
        }

        const otp = generateOTP()
        const htmlContent = generateOTPForgotPassword(otp)
        const emailSent = await sendEmail(email, 'Your OTP Code for RAS Forgot Password', htmlContent)

        if (!emailSent) {
            throw new Error('Failed to send OTP email')
        }

        storeOTP(email, otp)
        console.log(`OTP for ${email}: ${otp}`)

        return {
            message: 'OTP sent for password reset',
            otp_expires_in: getOTPExpiry()
        }
    }

    async resetPassword(email: string, otp: string, new_password: string) {
        // Kiểm tra OTP
        const isValid = await verifyOTP(email, otp)
        if (!isValid) {
            throw new Error('Invalid or expired OTP')
        }

        const user = await User.findOne({
            where: { email }
        })

        if (!user) {
            throw new Error('User not found')
        }

        const hashedPassword = await bcrypt.hash(new_password, 10)
        user.password = hashedPassword
        await user.save()
        clearOTP(email)

        return {
            message: 'Password reset successfully'
        }
    }

    async refreshToken(refresh_token: string) {
        try {
            const payload = verifyRefreshToken(refresh_token)
            return {
                access_token: generateAccessToken(payload)
            }
        } catch (error) {
            throw new Error('Invalid refresh token')
        }
    }

    async logout(refresh_token: string) {
        try {
            verifyRefreshToken(refresh_token)
            return {
                message: 'Logout successful'
            }
        } catch (error) {
            throw new Error('Invalid refresh token')
        }
    }
}
