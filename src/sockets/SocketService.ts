// src/services/SocketService.ts
import { Server, Socket } from 'socket.io'
import { SocketManager } from './SocketManager'
import { LocationRequestDto } from '~/dtos/location-request.dto'
import { LocationResponseDto } from '~/dtos/location-response.dto'
import { SosResponseDto } from '~/dtos/sos-request.dto'
import { MessageDTO } from '~/dtos/messageDTO'
import { CallingMessageDTO } from '~/dtos/calling-mesage.dto'

export class SocketService {
    private static instance: SocketService
    private io: Server | null = null

    private constructor() {} // ✅ private constructor để ngăn tạo mới

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

        this.io.on('connection', this.handleConnection.bind(this))
    }

    private async handleConnection(socket: Socket): Promise<void> {
        console.log('New client connected:', socket.id)

        socket.on('register', async (data: { userId: string }) => {
            await this.handleRegister(socket, data)
        })

        socket.on('disconnect', async () => {
            await this.handleDisconnect(socket)
        })

        this.handleSignalingServer(socket)
    }

    private async handleRegister(socket: Socket, data: { userId: string }): Promise<void> {
        if (!this.io) throw new Error('Socket.IO server not initialized')
        try {
            const userId = data.userId
            await SocketManager.registerSocket(userId, socket.id)
            SocketManager.setUserIdToSocket(socket, userId)

            socket.emit('register_response', {
                status: 'success',
                message: `Registered for user ${userId}`
            })
        } catch (error) {
            console.error('Registration error:', error)
            socket.emit('error', { message: 'Registration failed' })
        }
    }

    private async handleDisconnect(socket: Socket): Promise<void> {
        const userId = SocketManager.getUserIdFromSocket(socket)
        if (userId) {
            await SocketManager.removeSocket(userId)
        }
        console.log('Client disconnected:', socket.id)
    }

    public async handleSignalingServer(socket: Socket): Promise<void> {
        if (!this.io) throw new Error('Socket.IO server not initialized')

        socket.on('calling', async (message: CallingMessageDTO) => {
            console.log('Received calling message:', message)

            switch (message.type) {
                case 'start_call': {
                    const userToCall = await SocketManager.getSocketId(message.toId)

                    if (userToCall) {
                        socket.emit('call_response', {
                            type: 'call_response',
                            data: 'user is not online'
                        })
                    } else {
                        socket.emit('call_response', {
                            type: 'call_response',
                            data: 'user is not online'
                        })
                    }

                    break
                }

                case 'create_offer': {
                    const userToReceiveOffer = await SocketManager.getSocketId(message.toId)

                    if (userToReceiveOffer && this.io) {
                        this.io.to(userToReceiveOffer).emit(
                            'calling',
                            JSON.stringify({
                                type: 'offer_received',
                                name: message.name,
                                fromId: message.fromId,
                                data: message.data.sdp
                            })
                        )
                    }
                    break
                }

                case 'create_answer': {
                    const userToReceiveAnswer = await SocketManager.getSocketId(message.toId)
                    if (userToReceiveAnswer && this.io) {
                        this.io.to(userToReceiveAnswer).emit(
                            'calling',
                            JSON.stringify({
                                type: 'answer_received',
                                name: message.name,
                                fromId: message.fromId,
                                data: message.data.sdp
                            })
                        )
                    }
                    break
                }

                case 'ice_candidate': {
                    const userToReceiveIceCandidate = await SocketManager.getSocketId(data.toId)
                    if (userToReceiveIceCandidate && this.io) {
                        this.io.to(userToReceiveIceCandidate).emit(
                            'calling',
                            JSON.stringify({
                                type: 'ice_candidate',
                                name: message.name,
                                fromId: message.fromId,
                                data: {
                                    sdpMLineIndex: message.data.sdpMLineIndex,
                                    sdpMid: message.data.sdpMid,
                                    sdpCandidate: message.data.sdpCandidate
                                }
                            })
                        )
                    }
                    break
                }
            }
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
    public emitToSocket(socketId: string, event: string, data: any): void {
        if (!this.io) throw new Error('Socket.IO server not initialized')
        this.io.to(socketId).emit(event, data)
    }

    public async handleSosRequest(socketId: string, data: SosResponseDto): Promise<void> {
        if (!this.io) throw new Error('Socket.IO server not initialized')
        this.io.to(socketId).emit('sos_request', {
            teamId: data.teamId,
            userId: data.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address
        })
    }

    public async sendMessage(message: MessageDTO, toIds: string[]): Promise<void> {
        if (!this.io) throw new Error('Socket.IO server not initialized')
        const socketIds = await SocketManager.getListOfSocketIds(toIds)
        if (socketIds.length === 0) {
            console.log(`No online users found for IDs: ${toIds.join(', ')}`)
            return
        }
        if (socketIds.length !== 0) {
            this.io.to(socketIds).emit('message', message)
        }
    }

    public async getListOnlineUsers(userIds: string[]): Promise<string[]> {
        if (!this.io) throw new Error('Socket.IO server not initialized')
        const onlineUsers = await SocketManager.getListOnlineUsers(userIds)
        return onlineUsers
    }

    public async sendToOnlineUsers(userIds: string[], event: string, payload: any): Promise<void> {
        if (!this.io) throw new Error('Socket.IO server not initialized')
        const socketIds = await SocketManager.getListOfSocketIds(userIds)
        if (socketIds.length > 0) {
            this.io.to(socketIds).emit(event, payload)
            console.log(`Notification sent to online users: ${userIds.join(', ')}`)
        } else {
            console.log('No online users found.')
        }
    }
}
