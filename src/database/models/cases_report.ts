import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../connection'

interface CasesReportAttributes {
    id: number
    status: string
    created_at?: Date
    updated_at?: Date
    completion_time?: Date | null
    sos_list?: number[] | null
}

interface CasesReportCreationAttributes
    extends Optional<CasesReportAttributes, 'id' | 'created_at' | 'updated_at' | 'completion_time' | 'sos_list'> {}

class CasesReport extends Model<CasesReportAttributes, CasesReportCreationAttributes> implements CasesReportAttributes {
    public id!: number
    public status!: string
    public created_at!: Date
    public updated_at!: Date
    public completion_time!: Date | null
    public sos_list!: number[] | null

    public readonly createdAt!: Date
    public readonly updatedAt!: Date
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
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        completion_time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        sos_list: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'cases_report',
        timestamps: false
    }
)

export { CasesReport }
