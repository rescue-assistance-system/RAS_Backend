import { Server } from 'socket.io'
import { SocketService } from './SocketService'

export const setupSocketIO = (io: Server) => {
    const socketService = SocketService.getInstance()
    socketService.initialize(io)
    return socketService
}

export * from '../types/socket.types'
