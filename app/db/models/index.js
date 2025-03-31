import {Sequelize} from 'sequelize'
import databaseConfig from '../../config/database.js'

import {initUserModel} from './user/index.js'

const env = process.env.NODE_ENV || 'development'

const config = {
  ...databaseConfig[env]
}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

const models = {
  ...initUserModel(sequelize)
}

Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models))

models.sequelize = sequelize
models.Sequelize = Sequelize

const checkDatabaseConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

checkDatabaseConnection()

export default models
