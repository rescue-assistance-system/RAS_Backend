import express, { Express } from 'express'
import { errorConverter, errorHandler } from './middleware'
import config from './configs/config'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import redisClient from './configs/redis.config'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './configs/swagger.config'
import { createServer } from 'http'
import routes from './routes/index'
import cors from 'cors'
import { setupSocketIO } from './sockets'
import { Server } from 'socket.io'
import path from 'path'
import { setupSOSRoutes } from './routes/sosRoutes/sos.routes'

const app: Express = express()

// CORS configuration
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['*']
    })
)

// Middleware setup
app.use(express.json())
app.use(morgan('dev'))
app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
)
app.use(compression())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))

// Create HTTP server
const httpServer = createServer(app)

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: { origin: '*' },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000 // 25 seconds
})
const socketService = setupSocketIO(io)

// API routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api', routes)
app.use('/api/sos', setupSOSRoutes(io))

// Error handling middlewares
app.use(errorConverter)
app.use(errorHandler)

// Redis Connection
console.time('Redis Connection')
redisClient
    .connect()
    .then(() => {
        console.log('Successfully connected to Redis')
        console.timeEnd('Redis Connection')
    })
    .catch((err) => {
        console.error('Failed to connect to Redis:', err)
        console.timeEnd('Redis Connection')
    })

// Start the server
httpServer.listen(config.PORT, () => {
    console.log(`🚀 Server is running on port ${config.PORT}`)
    console.log(`📄 Swagger Docs available at http://localhost:${config.PORT}/api-docs`)
    console.log(`🔌 WebSocket server is ready at ws://localhost:${config.PORT}`)
})

// Graceful shutdown
const exitHandler = (err: any) => {
    console.log('🔴 Shutting down server...')
    console.log('error: ', err)
    httpServer.close(() => {
        io.close(() => {
            console.log('✅ WebSocket server closed')
        })

        redisClient.quit().then(() => {
            console.log('✅ Redis connection closed')
        })

        console.log('✅ HTTP server closed')
        process.exit(1)
    })
}

process.on('uncaughtException', exitHandler)
process.on('unhandledRejection', exitHandler)

export { app, httpServer, io }
