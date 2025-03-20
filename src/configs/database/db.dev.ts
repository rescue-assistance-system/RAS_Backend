import { IDatabaseConfig } from './db.config'
import appConfig from '../config'

const devConfig: IDatabaseConfig = {
    host: appConfig.DB_HOST ?? 'localhost',
    user: appConfig.DB_USERNAME ?? 'root',
    password: appConfig.DB_PASSWORD ?? 'rootpassword',
    database: appConfig.DB_NAME ?? 'mydatabase_dev',
    port: parseInt(appConfig.DB_PORT ?? '3306', 10)
}

export default devConfig
