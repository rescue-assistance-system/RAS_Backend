import { Model, DataTypes } from 'sequelize'
import sequelize from '../connection'
import User from './user.model'

class RescueTeam extends Model {
    // public id!: number
    // public userId!: number
    // public team_name!: string
    // public team_members!: any[]
    // public default_latitude!: number
    // public default_longitude!: number
    // public description!: string
    // public is_active!: boolean
    // public readonly createdAt!: Date
    // public readonly updatedAt!: Date
}

RescueTeam.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },
        team_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        team_members: {
            type: DataTypes.JSONB, 
            allowNull: true,
            defaultValue: [],
            get() {
                const rawValue = this.getDataValue('team_members')
                console.log('Getting team_members raw value:', rawValue)
                if (!rawValue) return []
                if (typeof rawValue === 'object') return rawValue
                try {
                    return JSON.parse(rawValue)
                } catch (error) {
                    console.error('Error parsing team_members:', error)
                    return []
                }
            },
            set(value) {
                console.log('Setting team_members value:', value)
                if (!value) {
                    this.setDataValue('team_members', [])
                    return
                }
                if (typeof value === 'string') {
                    this.setDataValue('team_members', value)
                    return
                }
                try {
                    this.setDataValue('team_members', value)
                } catch (error) {
                    console.error('Error setting team_members:', error)
                    this.setDataValue('team_members', [])
                }
            }
        },
        default_latitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        default_longitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        sequelize,
        modelName: 'RescueTeam',
        tableName: 'rescue_teams'
    }
)

RescueTeam.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
User.hasOne(RescueTeam, { foreignKey: 'user_id', as: 'rescue_team' })

export default RescueTeam
