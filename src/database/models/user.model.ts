import { DataTypes } from 'sequelize'
import sequelize from '../connection'
import { BaseModel } from './base.model'

class User extends BaseModel {
    // public id!: number
    // public username!: string
    // public phone!: string
    // public email!: string
    // public password!: string
    // public role!: 'user' | 'admin' | 'rescue_team' | 'coordinator'
    // public gender!: 'male' | 'female'
    // public birthday!: Date
    // public cccd!: string
    // public latitude!: number
    // public longitude!: number
    // public is_verified!: boolean
    // public device_id!: string
    // public readonly created_at!: Date
    // public readonly updated_at!: Date
    // public tracking_code!: string
    // public fcm_token!: string
    // public avatar!: string
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('user', 'admin', 'rescue_team', 'coordinator'),
            allowNull: false,
            defaultValue: 'user'
        },
        gender: {
            type: DataTypes.ENUM('male', 'female'),
            allowNull: true
        },
        birthday: {
            type: DataTypes.DATE,
            allowNull: true
        },
        cccd: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        device_id: {
            type: DataTypes.STRING,
            allowNull: true
            // unique: true
        },
        tracking_code: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        fcm_token: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'accounts_ras_sys',
        timestamps: true,
        underscored: true
    }
)
// User.hasMany(SosRequest, { foreignKey: 'user_id', as: 'sosRequests' })
export default User
