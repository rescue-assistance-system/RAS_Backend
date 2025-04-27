import { RedisManager } from '~/middleware/redis.middleware'
import { CustomSocket } from '~/types/socket.types'

export class SocketManager {
    private static instance: SocketManager
    private rescueTeams: Array<{ id: string; role: string }> = []
    private roomCreators: Map<string, string> = new Map() // roomId -> creatorSocketId

    private constructor() {}

    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager()
        }
        return SocketManager.instance
    }

    static async registerSocket(userId: string, socketId: string): Promise<void> {
        await RedisManager.setSocketIdToRedis(userId, socketId)
    }

    static async removeSocket(userId: string): Promise<void> {
        await RedisManager.removeSocketIdFromRedis(userId)
    }

    static async getSocketId(userId: string): Promise<string | null> {
        return await RedisManager.getSocketIdFromRedis(userId)
    }

    public registerRescueTeam(teamData: { id: string; role: string }): void {
        this.rescueTeams.push(teamData)
    }

    public removeRescueTeam(socketId: string): void {
        const index = this.rescueTeams.findIndex((team) => team.id === socketId)
        if (index !== -1) {
            this.rescueTeams.splice(index, 1)
        }
    }

    public getRescueTeams(): Array<{ id: string; role: string }> {
        return this.rescueTeams
    }

    public setRoomCreator(roomId: string, creatorSocketId: string): void {
        this.roomCreators.set(roomId, creatorSocketId)
    }

    public getRoomCreator(roomId: string): string | undefined {
        return this.roomCreators.get(roomId)
    }

    public removeRoom(roomId: string): void {
        this.roomCreators.delete(roomId)
    }

    static getUserIdFromSocket(socket: CustomSocket): string | undefined {
        return socket.userId
    }

    static setUserIdToSocket(socket: CustomSocket, userId: string): void {
        socket.userId = userId
    }
}
