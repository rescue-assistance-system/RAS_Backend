// src/services/socket.service.ts
import { Server, Socket } from 'socket.io'
import redisClient from '../configs/redis.config'
// import { LocationService } from './location.service';

export class SocketService {
    private io: Server
    // private locationService: LocationService;

    constructor(io: Server) {
        this.io = io
        // this.locationService = new LocationService();
        this.setupSocketHandlers()
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', this.handleConnection.bind(this))
    }

    private async handleConnection(socket: Socket): Promise<void> {
        console.log('New client connected:', socket.id)
        socket.on('register', async (data: { userId: string }) => {
            await this.handleRegister(socket, data)
        })

        // socket.on('send_location', async (data: {
        //     userId: string;
        //     latitude: number;
        //     longitude: number;
        // }) => {
        //     await this.handleLocationUpdate(socket, data);
        // });
        socket.on('disconnect', async () => {
            await this.handleDisconnect(socket)
        })
    }

    private async handleRegister(socket: Socket, data: { userId: string }): Promise<void> {
        try {
            const { userId } = data
            await redisClient.set(`user_socket:${userId}`, socket.id)
            socket.data.userId = userId

            socket.emit('register_response', {
                status: 'success',
                message: `Registered for user ${userId}`
            })
        } catch (error) {
            socket.emit('error', { message: 'Registration failed' })
        }
    }

    // private async handleLocationUpdate(
    //     socket: Socket,
    //     data: { userId: string; latitude: number; longitude: number }
    // ): Promise<void> {
    //     try {
    //         await this.locationService.processLocationUpdate(data, this.io);
    //     } catch (error) {
    //         socket.emit('error', { message: 'Location update failed' });
    //     }
    // }

    private async handleDisconnect(socket: Socket): Promise<void> {
        if (socket.data.userId) {
            await redisClient.del(`user_socket:${socket.data.userId}`)
        }
        console.log('Client disconnected:', socket.id)
    }
}
