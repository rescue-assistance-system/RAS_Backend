import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User, IUser } from '../database'
import { ApiError, encryptPassword, isPasswordMatch } from '../utils'
import config from '../configs/config'

const jwtSecret = config.JWT_SECRET as string
const COOKIE_EXPIRATION_DAYS = 90 // cookie expiration in days
const expirationDate = new Date(Date.now() + COOKIE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000)
const cookieOptions = {
    expires: expirationDate,
    secure: false,
    httpOnly: true
}

// User registers an account using phone number or email.
const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, phone_number, email, password, device_id } = req.body

        console.log(name, email, password)

        const userExists = await User.findOne({ where: { email } })
        if (userExists) {
            throw new ApiError(400, 'User already exists!')
        }

        const user = await User.create({
            name,
            email,
            password: await encryptPassword(password)
        })

        const userData = {
            id: user.id,
            name: user.username,
            email: user.email
        }

        res.status(201).json({
            status: 201,
            message: 'User registered successfully!',
            data: userData
        })
    } catch (error: unknown) {
        console.error('❌ Error in register:', error)
        res.status(500).json({
            status: 500,
            message: error instanceof Error ? error.message : 'Something went wrong'
        })
    }
}

// Create and Send JWT Token
const createSendToken = async (user: IUser, res: Response) => {
    try {
        const { username, email, id } = user

        const token = jwt.sign({ username, email, id }, jwtSecret, {
            expiresIn: '1d'
        })

        res.cookie('jwt', token, cookieOptions)

        return token
    } catch (error) {
        console.error('❌ Error in createSendToken:', error)
        return null
    }
}

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email }, attributes: ['id', 'name', 'email', 'password'] })

        if (!user || !(await isPasswordMatch(password, user.password))) {
            throw new ApiError(400, 'Incorrect email or password')
        }

        const token = await createSendToken(user, res)

        res.status(200).json({
            status: 200,
            message: 'User logged in successfully!',
            token
        })
    } catch (error: unknown) {
        console.error('❌ Error in login:', error)
        res.status(500).json({
            status: 500,
            message: error instanceof Error ? error.message : 'Something went wrong'
        })
    }
}

export default {
    register,
    login
}
