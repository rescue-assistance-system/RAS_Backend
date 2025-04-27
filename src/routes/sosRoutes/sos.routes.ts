import express from 'express'
import { Server } from 'socket.io'
import { SOSController } from '../../controllers/sos.controller'

const router = express.Router()

export const setupSOSRoutes = (io: Server) => {
    const sosController = new SOSController(io)

    router.post('/send', async (req, res) => {
        try {
            await sosController.sendSOS(req, res)
        } catch (error) {
            console.error('Route error:', error)
            res.status(500).json({
                status: 'ERROR',
                message: 'Internal server error'
            })
        }
    })

    return router
}
