// socket.service.ts
import { Server, Socket } from 'socket.io'
import redisClient from '../configs/redis.config'
import { createSocketServer } from '../configs/socket.config'

export class SocketService {
    private io: Server

    constructor(server: any) {
        this.io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        })

        this.setupSocketHandlers()
    }

    private setupSocketHandlers() {
        this.io.on('connection', async (socket: Socket) => {
            console.log('Client connected:', socket.id)
            socket.on('register', async (data: { userId: string }) => {
                try {
                    const { userId } = data
                    await redisClient.set(`user_socket:${userId}`, socket.id)
                    socket.data.userId = userId

                    socket.emit('register_response', {
                        status: 'success',
                        message: `Registered for user ${userId}`,
                        socketId: socket.id
                    })
                } catch (error) {
                    socket.emit('error', {
                        message: 'Registration failed'
                    })
                }
            })

            socket.on('send_location', async (data: { userId: string; latitude: number; longitude: number }) => {
                try {
                    const { userId, latitude, longitude } = data

                    await this.saveLocation(userId, latitude, longitude)

                    const trackers = await this.getTrackers(userId)

                    for (const trackerId of trackers) {
                        const trackerSocketId = await redisClient.get(`user_socket:${trackerId}`)
                        if (trackerSocketId) {
                            this.io.to(trackerSocketId).emit('receive_location', {
                                userId,
                                latitude,
                                longitude,
                                timestamp: new Date()
                            })
                        }
                    }

                    socket.emit('location_sent', {
                        status: 'success',
                        timestamp: new Date()
                    })
                } catch (error) {
                    socket.emit('error', {
                        message: 'Failed to process location update'
                    })
                }
            })
            socket.on('disconnect', async () => {
                if (socket.data.userId) {
                    await redisClient.del(`user_socket:${socket.data.userId}`)
                }
                console.log('Client disconnected:', socket.id)
            })
        })
    }
}
