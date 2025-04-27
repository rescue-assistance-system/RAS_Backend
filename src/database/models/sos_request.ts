import { Model, DataTypes } from 'sequelize'
import sequelize from '../connection'

export class SOSRequest extends Model {
    public id!: number
    public user_id!: number
    public latitude!: number
    public longitude!: number
    public status!: string
    public nearest_team_ids!: number[]
    public case_id!: number | null
    public readonly created_at!: Date
    public readonly updated_at!: Date
}

SOSRequest.init(
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
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'pending'
        },
        nearest_team_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true
        },
        case_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'cases_report',
                key: 'id'
            },
            onDelete: 'SET NULL'
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        modelName: 'SOSRequest',
        tableName: 'sos_requests',
        timestamps: true,
        underscored: true
    }
)

export default SOSRequest
