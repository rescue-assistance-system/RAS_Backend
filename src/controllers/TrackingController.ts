import { Request, Response } from 'express'

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
