import { Sequelize } from 'sequelize'
import dbConfig from '../configs/database'

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: false,
    timezone: '+07:00',
    dialectOptions: {
        useUTC: false, // ✅ Thêm dòng này
        timezone: '+07:00' // ✅ Thêm dòng này
    },
    define: {
        timestamps: true,
        underscored: true
    }
})

sequelize
    .authenticate()
    .then(() => {
        console.log('✅ Database connection established successfully.')
        return sequelize.sync({ force: false })
    })
    .then(() => console.log('✅ Database & tables synced successfully'))
    .catch((err) => console.error('❌ Database error:', err))

export default sequelize
