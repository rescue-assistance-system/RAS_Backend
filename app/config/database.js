

const databaseConfig = {
  database: process.env.DB_NAME || 'ras_local',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  dialect: process.env.DB_DIALECT || 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // Supabase yêu cầu SSL
      rejectUnauthorized: false // Bỏ kiểm tra chứng chỉ SSL
    }
  },
  pool: {
    max: 200,
    min: 2,
    acquire: 30000,
    idle: 10000
  },
  benchmark: true
}
const local = {
  ...databaseConfig,
  database: process.env.DB_NAME || 'liveboat_local',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root'
}

const development = {
  ...databaseConfig
}

const test = {
  ...databaseConfig
}

const production = {
  ...databaseConfig
}

export default {
  local,
  development,
  test,
  production
}
