import devConfig from './db.dev'
import prodConfig from './db.prod'
import { IDatabaseConfig } from './db.config'
import path from 'path'
import { config } from 'dotenv'

const env = process.env.NODE_ENV ?? 'development'

const envFile = `.env.${env}`
const envPath = path.resolve(__dirname, '../../', envFile)

console.log('envPath', envPath)

config({ path: envPath })

const dbConfig: IDatabaseConfig = env === 'production' ? prodConfig : devConfig

export default dbConfig
