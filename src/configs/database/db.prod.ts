import { IDatabaseConfig } from './db.config'

const prodConfig: IDatabaseConfig = {
    host: process.env.DB_HOST ?? 'prod-db-server',
    user: process.env.DB_USERNAME ?? 'admin',
    password: process.env.DB_PASSWORD ?? 'securepassword',
    database: process.env.DB_NAME ?? 'mydatabase_prod',
    port: parseInt(process.env.DB_PORT ?? '3306', 10)
}

export default prodConfig
