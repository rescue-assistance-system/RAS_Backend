import { Socket } from 'socket.io'

export interface CustomSocket extends Socket {
    roomId?: string
    role?: string
    userId?: string
}

export interface Location {
    lat: number
    lng: number
}

export interface SOSRequest {
    userId: string
    location: Location
    message?: string
    roomId?: string
    rescueTeams?: Array<{ id: string; role: string }>
}

export interface RoomData {
    roomId: string
    position?: any
    totalConnectedUsers?: string[]
}
