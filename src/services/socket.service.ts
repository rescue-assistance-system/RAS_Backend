// socket.service.ts
import { Server, Socket } from 'socket.io'
import redisClient from '../configs/redis.config'

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

            // Xử lý khi client gửi userId để đăng ký
            socket.on('register', async (data: { userId: string }) => {
                try {
                    const { userId } = data
                    // Lưu mapping userId -> socketId vào Redis
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

            // Xử lý location updates
            socket.on('send_location', async (data: { userId: string; latitude: number; longitude: number }) => {
                try {
                    const { userId, latitude, longitude } = data

                    // Lưu location vào DB
                    await this.saveLocation(userId, latitude, longitude)

                    // Lấy danh sách trackers của user này
                    const trackers = await this.getTrackers(userId)

                    // Gửi location tới tất cả trackers
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

                    // Gửi confirmation về cho sender
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

            // Xử lý disconnect
            socket.on('disconnect', async () => {
                if (socket.data.userId) {
                    await redisClient.del(`user_socket:${socket.data.userId}`)
                }
                console.log('Client disconnected:', socket.id)
            })
        })
    }
}
