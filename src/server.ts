import express, { Express } from 'express'
import { Server } from 'http'
import userRouter from './routes/auth.routes'
import { errorConverter, errorHandler } from './middleware'
import sequelize from './database/connection'
import config from './configs/config'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import redisClient from './configs/redis.config'

const app: Express = express()

// Middleware to parse JSON requests
app.use(express.json())
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.urlencoded({ extended: true }))

// Route handling: All routes inside `userRouter` will be prefixed with `/api`
app.use('/api/auth', userRouter)

// Error handling middlewares
app.use(errorConverter)
app.use(errorHandler)

console.time('Redis Connection')
redisClient
    .connect()
    .then(() => {
        console.log('Successfully connected to Redis')
        console.timeEnd('Redis Connection') // Kết thúc đo thời gian
    })
    .catch((err) => {
        console.error('Failed to connect to Redis:', err)
        console.timeEnd('Redis Connection')
    })

// Start the Auth Service server
const server: Server = app.listen(config.PORT, () => {
    console.log(`🚀 Auth Service is running on port ${config.PORT}`)
})

// Graceful shutdown
const exitHandler = () => {
    console.log('🔴 Shutting down Auth Service...')
    server.close(() => {
        console.info('✅ Auth Service closed')
        process.exit(1)
    })
}

process.on('uncaughtException', exitHandler)
process.on('unhandledRejection', exitHandler)
