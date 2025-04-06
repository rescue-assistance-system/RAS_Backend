export interface IDatabaseConfig {
    host: string
    user: string
    password: string
    database: string
    port: number
}

const baseConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ras_backend',
    port: parseInt(process.env.DB_PORT ?? '3307', 10)
}

export default baseConfig
