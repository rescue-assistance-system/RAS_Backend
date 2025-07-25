import { config } from 'dotenv'
import path from 'path'

const configFile = path.resolve(__dirname, `../../.env.${process.env.NODE_ENV ?? 'development'}`)
config({ path: configFile })

console.log(`✅ Loaded environment variables from ${configFile}`)

const {
    PORT,
    SOCKET_PORT,
    JWT_SECRET,
    NODE_ENV,
    MESSAGE_BROKER_URL,
    DB_HOST,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
    DB_DIALECT,
    APP_URL
} = process.env

const appConfig = {
    PORT,
    SOCKET_PORT,
    JWT_SECRET,
    env: NODE_ENV,
    msgBrokerURL: MESSAGE_BROKER_URL,
    DB_HOST,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
    DB_DIALECT,
    APP_URL: process.env.APP_URL || 'https://ras-backend.onrender.com',
    COOKIE_EXPIRATION_DAYS: 90,
    COOKIE_EXPIRATION_HOURS: 24,
    COOKIE_EXPIRATION_MINUTES: 60,
    COOKIE_EXPIRATION_SECONDS: 60,
    SALT_ROUNDS: 12
}
console.log('APP_URL:', process.env.APP_URL)

export default appConfig
