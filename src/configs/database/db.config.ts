export interface IDatabaseConfig {
    host: string
    user: string
    password: string
    database: string
    port: number
}

const baseConfig = {
    port: parseInt(process.env.DB_PORT ?? '3307', 10)
}

export default baseConfig
