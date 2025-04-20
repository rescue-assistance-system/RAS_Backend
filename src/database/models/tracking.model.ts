import { Model, DataTypes } from 'sequelize'
import sequelize from '../connection'
import User from './user.model'

class Tracking extends Model {
    // public id!: number
    // public tracker_user_id!: number
    // public target_user_id!: number
    // public status!: 'pending' | 'accepted' | 'rejected'
    // public readonly created_at!: Date
    // public readonly updated_at!: Date
}

Tracking.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tracker_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        target_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending'
        },
        tracking_status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 'true'
        }
    },
    {
        sequelize,
        modelName: 'Tracking',
        tableName: 'tracking_permissions',
        timestamps: true
    }
)
Tracking.belongsTo(User, {
    foreignKey: 'tracker_user_id',
    as: 'tracker'
})

Tracking.belongsTo(User, {
    foreignKey: 'target_user_id',
    as: 'target'
})

export default Tracking
