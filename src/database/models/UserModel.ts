import { DataTypes, Model } from 'sequelize'
import Database from '../connection'

const sequelize = Database.getInstance()

export interface IUser extends Model {
    id: number
    full_name: string
    phone_number: string
    email: string
    password: string
    device_id: string
    role: string
    createdAt: Date
    updatedAt: Date
}

const User = sequelize.define<IUser>(
    'User',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Full name is required' },
                len: { args: [3, 100], msg: 'Full name must be between 3 and 100 characters' }
            }
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                is: {
                    args: /^[\d+\-().\s]+$/,
                    msg: 'Phone number contains invalid characters'
                },
                len: {
                    args: [7, 20],
                    msg: 'Phone number must be between 7 and 20 characters'
                }
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: 'Email is required' },
                isEmail: { msg: 'Please provide a valid email address' }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Password is required' },
                len: { args: [8, 100], msg: 'Password must be at least 8 characters long' }
            }
        },
        device_id: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                len: { args: [0, 100], msg: 'Device ID must be less than 100 characters' }
            }
        },
        role: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'user',
            validate: {
                isIn: {
                    args: [['user', 'admin', 'moderator']],
                    msg: 'Role must be one of: user, admin, moderator'
                }
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        timestamps: true,
        tableName: 'users'
    }
)

export default User
