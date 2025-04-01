import { Model, DataTypes } from 'sequelize'
import sequelize from '../connection'

class User extends Model {
    // public id!: number
    // public username!: string
    // public phone!: string
    // public email!: string
    // public password!: string
    // public role!: 'user' | 'admin' | 'rescue_team'
    // public gender!: 'male' | 'female'
    // public birthday!: Date
    // public cccd!: string
    // public latitude!: number
    // public longitude!: number
    // public is_verified!: boolean
    // public device_id!: string
    // public readonly created_at!: Date
    // public readonly updated_at!: Date
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
            allowNull: false,
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
            type: DataTypes.ENUM('user', 'admin', 'rescue_team'),
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
            allowNull: true,
            unique: true
        }
    },
    {
        sequelize,
        tableName: 'accounts',
        timestamps: true,
        underscored: true
    }
)

export default User
