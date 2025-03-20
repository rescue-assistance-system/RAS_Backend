import { Sequelize } from 'sequelize'
import dbConfig from '../configs/database'

class Database {
    private static instance: Sequelize

    private constructor() {}

    /**
     * Get the singleton instance of the Sequelize database connection.
     * @returns The Sequelize instance
     */
    public static getInstance(): Sequelize {
        if (!Database.instance) {
            Database.instance = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
                host: dbConfig.host,
                port: dbConfig.port,
                dialect: 'postgres',
                logging: console.log
            })

            Database.instance
                .sync({ alter: true })
                .then(() => console.log('✅ Database & tables synced successfully'))
                .catch((err) => console.error('❌ Database sync error:', err))
        }
        return Database.instance
    }
}

export default Database
