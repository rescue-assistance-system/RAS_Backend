import { DataTypes } from 'sequelize'
import sequelize from '../connection'
import User from './user.model'
import { BaseModel } from './base.model'

class Message extends BaseModel {
    public id!: number
    public from_id!: number
    public created_at!: Date
    public content!: string
    public content_type!: string
    public sender_name?: string
    public case_id!: number
    public duration?: number
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        from_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        content_type: {
            type: DataTypes.ENUM('TEXT', 'IMAGE', 'VOICE', 'CALL', 'VIDEO_CALL'),
            allowNull: false
        },
        sender_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        case_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    },
    {
        sequelize,
        modelName: 'Message',
        tableName: 'messages',
        timestamps: false,
        underscored: true
    }
)

Message.belongsTo(User, { foreignKey: 'from_id', targetKey: 'id', as: 'sender' });

export default Message
