// src/services/socket.service.ts
import { Server, Socket } from 'socket.io'
import redisClient from '../configs/redis.config'

export class SocketService {
    private io: Server

    constructor(io: Server) {
        this.io = io
        this.setupSocketHandlers()
        console.log('🔌 Socket service initialized')
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', this.handleConnection.bind(this))
    }

    private handleConnection(socket: Socket): void {
        console.log('🟢 New client connected:', socket.id)

        socket.on('register', async (data: { userId: string }) => {
            try {
                console.log('📝 Register request:', data)
                await redisClient.set(`user_socket:${data.userId}`, socket.id)
                socket.data.userId = data.userId

                console.log('✅ User registered:', {
                    userId: data.userId,
                    socketId: socket.id
                })

                socket.emit('register_response', {
                    status: 'success',
                    message: `Registered for user ${data.userId}`
                })
            } catch (error) {
                console.error('❌ Registration error:', error)
                socket.emit('error', { message: 'Registration failed' })
            }
        })
    }
}
