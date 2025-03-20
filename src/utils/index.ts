import bcrypt from 'bcryptjs'

class ApiError extends Error {
    statusCode: number
    isOperational: boolean

    constructor(statusCode: number, message: string, isOperational = true, stack = '') {
        super(message)
        this.statusCode = statusCode
        this.isOperational = isOperational

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

// Convert env value to number, fallback to 12 rounds if undefined
const SALT_ROUNDS = Number(process.env.BCRYPT_COST) || 12

/**
 * Encrypts a password using bcrypt.
 * @param password - The plain text password to encrypt.
 * @returns Encrypted password as a promise.
 */
const encryptPassword = async (password: string): Promise<string> => {
    if (!password || typeof password !== 'string') {
        throw new ApiError(400, 'Invalid password: must be a non-empty string')
    }
    console.log(SALT_ROUNDS)
    return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compares a given password with the stored hash.
 * @param password - The input password.
 * @param userPassword - The hashed password from DB.
 * @returns Boolean indicating whether passwords match.
 */
const isPasswordMatch = async (password: string, userPassword: string): Promise<boolean> => {
    if (!password || !userPassword) {
        throw new ApiError(400, 'Password comparison failed: one or both passwords are missing.')
    }
    return await bcrypt.compare(password, userPassword)
}

export { ApiError, encryptPassword, isPasswordMatch }
