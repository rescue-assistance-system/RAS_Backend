import { Socket } from 'socket.io'
import { RedisManager } from '~/middleware/redis.middleware'

export class SocketManager {
    static async registerSocket(userId: string, socketId: string): Promise<void> {
        await RedisManager.setSocketIdToRedis(userId, socketId)
    }

    static async removeSocket(userId: string): Promise<void> {
        await RedisManager.removeSocketIdFromRedis(userId)
    }

    static async getSocketId(userId: string): Promise<string | null> {
        return await RedisManager.getSocketIdFromRedis(userId)
    }

    static getUserIdFromSocket(socket: Socket): string | undefined {
        return socket.data.userId
    }

    static setUserIdToSocket(socket: Socket, userId: string): void {
        socket.data.userId = userId
    }
}
