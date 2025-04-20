import { createResponse } from '~/utils/response.utils'
import { Response } from 'express'

// utils/handleError.ts
export const handleApiError = (res: Response, error: any, contextMessage = '') => {
    console.error(`${contextMessage}`, error)
    const errorMessage = error.message || 'Internal server error'

    if (errorMessage.includes('database')) {
        return res.status(500).json(createResponse('error', null, 'Database error occurred'))
    } else if (errorMessage.includes('network')) {
        return res.status(500).json(createResponse('error', null, 'Network error occurred'))
    } else {
        return res.status(400).json(createResponse('error', null, errorMessage))
    }
}
