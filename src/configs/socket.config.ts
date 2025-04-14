// src/configs/socket.config.ts
import { Server, ServerOptions } from 'socket.io'
import { Server as HttpServer } from 'http'

const socketConfig: Partial<ServerOptions> = {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['*']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    path: '/socket.io/'
}

// export function createSocketServer(httpServer: HttpServer): Server {
//     return new Server(httpServer, socketConfig)
// }
export function createSocketServer(httpServer: HttpServer): Server {
    const io = new Server(httpServer, socketConfig);
    console.log('🚀 Socket.IO server initialized');
    return io;
}
