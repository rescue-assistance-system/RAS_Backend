import { Sequelize } from 'sequelize'
import dbConfig from '../configs/database'

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: false,
    define: {
        timestamps: true,
        underscored: true
    }
})

// Test the connection and force sync tables
sequelize
    .authenticate()
    .then(() => {
        console.log('✅ Database connection established successfully.')
        return sequelize.sync({ force: false }) // This will drop and recreate all tables
    })
    .then(() => console.log('✅ Database & tables synced successfully'))
    .catch((err) => console.error('❌ Database error:', err))

export default sequelize
