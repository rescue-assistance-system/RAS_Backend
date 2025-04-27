// src/services/SocketService.ts
import { Server } from 'socket.io'
import { CustomSocket, SOSRequest, RoomData } from '~/types/socket.types'
import { SocketManager } from './SocketManager'
import { LocationRequestDto } from '~/dtos/location-request.dto'
import { LocationResponseDto } from '~/dtos/location-response.dto'
import redisClient from '~/configs/redis.config'

export class SocketService {
    private static instance: SocketService
    private io: Server | null = null
    private socketManager: SocketManager

    private constructor() {
        this.socketManager = SocketManager.getInstance()
    }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService()
        }
        return SocketService.instance
    }

    public initialize(io: Server): void {
        if (this.io) return // nếu đã khởi tạo thì bỏ qua
        this.io = io
        this.setupSocketHandlers()
    }

    private setupSocketHandlers(): void {
        if (!this.io) return

        this.io.on('connection', (socket: CustomSocket) => {
            console.log('New client connected123:', socket.id)
            socket.emit('yourSocketId', socket.id)

            socket.on('saveLocation', async (data) => {
                const { latitude, longitude } = data
                console.log('Received location data:', data)

                if (typeof latitude !== 'number' || typeof longitude !== 'number') {
                    console.error('Invalid location data received:', data)
                    return
                }

                const redisKey = `user:${socket.id}`
                console.log(redisKey, `user:${socket.id}`)

                redisClient.get(redisKey, (err, result) => {
                    if (err || !result) {
                        console.error('Failed to retrieve user data from Redis:', err || 'No data found')
                        return
                    }

                    const userData = JSON.parse(result)
                    console.log('userData before update:', userData)

                    userData.latitude = latitude
                    userData.longitude = longitude

                    redisClient.set(redisKey, JSON.stringify(userData), { EX: 3600 }, (err) => {
                        if (err) {
                            console.error('Error updating location in Redis:', err)
                        } else {
                            console.log(`Location updated for socket ${socket.id}:`, { latitude, longitude })
                        }
                    })
                })
            })

            this.setupUserEvents(socket)
            this.setupRoomEvents(socket)
            this.setupSOSEvents(socket)
            this.setupDisconnectHandler(socket)
        })
    }

    private setupUserEvents(socket: CustomSocket): void {
        socket.on('registerUser', async (data: { userId: string }) => {
            try {
                await SocketManager.registerSocket(data.userId, socket.id)
                socket.userId = data.userId
                socket.emit('register_response', {
                    status: 'success',
                    message: `Registered for user ${data.userId}`
                })
            } catch (error) {
                console.error('Registration error:', error)
                socket.emit('error', { message: 'Registration failed' })
            }
        })

        socket.on('registerRole', (data: { role: string }) => {
            socket.role = data.role
            if (data.role === 'rescueTeam') {
                this.socketManager.registerRescueTeam({ id: socket.id, role: data.role })
                this.io?.emit('updateRescueTeams', this.socketManager.getRescueTeams())
            }
        })
    }

    private setupRoomEvents(socket: CustomSocket): void {
        socket.on('createRoom', (data: RoomData) => {
            const roomId = Math.random().toString(36).substring(2, 7)
            socket.join(roomId)
            socket.roomId = roomId
            this.socketManager.setRoomCreator(roomId, socket.id)

            socket.emit('roomCreated', {
                roomId,
                position: data.position,
                totalConnectedUsers: [socket.id]
            })
        })

        socket.on('joinRoom', (data: { roomId: string }) => {
            const roomExists = this.io?.sockets.adapter.rooms.has(data.roomId)
            if (roomExists) {
                socket.join(data.roomId)
                socket.roomId = data.roomId

                const creatorSocketId = this.socketManager.getRoomCreator(data.roomId)
                if (creatorSocketId) {
                    const roomMembers = Array.from(this.io?.sockets.adapter.rooms.get(data.roomId) || [])
                    this.io?.to(creatorSocketId).emit('userJoinedRoom', {
                        userId: socket.id,
                        totalConnectedUsers: roomMembers
                    })
                }
                socket.emit('roomJoined', { status: 'OK' })
            } else {
                socket.emit('roomJoined', { status: 'ERROR' })
            }
        })
    }

    private setupSOSEvents(socket: CustomSocket): void {
        socket.on('sendSOS', (data: SOSRequest) => {
            const { roomId, location, message } = data
            const sos = {
                id: Math.random().toString(36).substring(2, 9),
                userId: socket.id,
                location,
                message,
                status: 'pending',
                createdAt: new Date()
            }

            if (roomId) {
                socket.to(roomId).emit('receiveSOS', sos)
            }

            // Notify rescue teams
            const rescueTeams = this.socketManager.getRescueTeams()
            rescueTeams.forEach((team) => {
                this.io?.to(team.id).emit('receiveSOS', sos)
            })
        })

        socket.on('updateLocation', (data) => {
            this.io?.emit('updateLocationResponse', data)
        })
    }

    private async setupDisconnectHandler(socket: CustomSocket): Promise<void> {
        socket.on('disconnect', async () => {
            console.log('Client disconnected:', socket.id)

            if (socket.userId) {
                await SocketManager.removeSocket(socket.userId)
            }

            if (socket.roomId) {
                if (this.socketManager.getRoomCreator(socket.roomId) === socket.id) {
                    const roomMembers = this.io?.sockets.adapter.rooms.get(socket.roomId)
                    if (roomMembers) {
                        roomMembers.forEach((socketId) => {
                            this.io?.to(socketId).emit('roomDestroyed', { status: 'OK' })
                        })
                    }
                    this.socketManager.removeRoom(socket.roomId)
                } else {
                    socket.leave(socket.roomId)
                    const creatorId = this.socketManager.getRoomCreator(socket.roomId)
                    if (creatorId) {
                        const roomMembers = Array.from(this.io?.sockets.adapter.rooms.get(socket.roomId) || [])
                        this.io?.to(creatorId).emit('userLeftRoom', {
                            userId: socket.id,
                            totalConnectedUsers: roomMembers
                        })
                    }
                }
            }

            this.socketManager.removeRescueTeam(socket.id)
            this.io?.emit('updateRescueTeams', this.socketManager.getRescueTeams())
        })
    }

    public async handleAskLocation(data: LocationRequestDto): Promise<void> {
        if (!this.io) throw new Error('Socket.IO server not initialized')
        const socketId = await SocketManager.getSocketId(data.toId)
        if (socketId) {
            this.io.to(socketId).emit('ask_location', {
                fromId: data.fromId,
                toId: data.toId
            })
        } else {
            console.log(`User ${data.toId} is offline, cannot ask for location`)
        }
    }

    public async handleLocationResponse(data: LocationResponseDto): Promise<void> {
        if (!this.io) throw new Error('Socket.IO server not initialized')
        const socketId = await SocketManager.getSocketId(data.toId)
        if (socketId) {
            this.io.to(socketId).emit('location_response', {
                fromId: data.fromId,
                toId: data.toId,
                latitude: data.latitude,
                longitude: data.longitude
            })
        } else {
            throw new Error(`User ${data.toId} is offline, cannot send location response`)
        }
    }
}
