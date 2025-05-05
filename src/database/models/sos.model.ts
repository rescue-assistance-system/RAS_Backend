import { Model, DataTypes } from 'sequelize'
import sequelize from '../connection'
import CasesReport from './case_report.model'
import User from './user.model'

class SosRequest extends Model {
    // public id!: number
    // public user_id!: number
    // public latitude!: number | null
    // public longitude!: number | null
    // public created_at!: Date
    // public updated_at!: Date
    // public nearest_team_ids!: number[] | null
    // public case_id!: number | null
}

SosRequest.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        latitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: true
        },
        longitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        nearest_team_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true
        },
        case_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'SosRequest',
        tableName: 'sos_requests',
        timestamps: false,
        underscored: true
    }
)

// Associations
SosRequest.belongsTo(CasesReport, { foreignKey: 'case_id', as: 'case' })
SosRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

export default SosRequest
