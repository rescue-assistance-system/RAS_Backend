const databaseConfig = {
    database: process.env.DB_NAME || "liveboat_local",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "3306",
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root",
    dialect: process.env.DB_DIALECT || "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
        decimalNumbers: true
      }
    },
    operatorsAliases: 0,
    pool: {
        max: 200,            // Maximum number of connections in the pool
        min: 2,             // Minimum number of connections in the pool
        acquire: 30000,     // Maximum time (ms) to try getting a connection before throwing error
        idle: 10000,        // Time (ms) a connection can stay idle before being released
      },
    benchmark: true
};

const local = {
    ...databaseConfig,
    database: process.env.DB_NAME || "liveboat_local",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "3306",
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root"
};

const development = {
  ...databaseConfig
};

const test = {
  ...databaseConfig
};

const production = {
  ...databaseConfig
};

export default{
  local,
  development,
  test,
  production
};