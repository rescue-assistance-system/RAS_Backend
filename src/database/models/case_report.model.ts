import { Model, DataTypes } from 'sequelize'
import sequelize from '../connection'
import User from './user.model'

class CasesReport extends Model {
    // public id!: number
    // public status!: string
    // public created_at!: Date
    // public accepted_at!: Date | null
    // public sos_list!: number[] | null
    // public ready_at!: Date | null
    // public completed_at!: Date | null
    // public cancelled_at!: Date | null
    // public from_id!: number
    // public accepted_team_id!: number | null
}

CasesReport.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        accepted_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        ready_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        cancelled_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        from_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        accepted_team_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        sos_list: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true
        },
        rejected_team_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true
        },
        cancelled_reason: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        completed_description: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'CasesReport',
        tableName: 'cases_report',
        timestamps: false,
        underscored: true
    }
)

// Associations
CasesReport.belongsTo(User, { foreignKey: 'from_id', as: 'from' })
CasesReport.belongsTo(User, { foreignKey: 'accepted_team_id', as: 'acceptedTeam' })

export default CasesReport
