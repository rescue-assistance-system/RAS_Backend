import { DataTypes } from 'sequelize'
import sequelize from '../connection'
import CasesReport from './case_report.model'
import User from './user.model'
import { BaseModel } from './base.model'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

class SosRequest extends BaseModel {}

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
            allowNull: false,
            defaultValue: DataTypes.NOW,
            get() {
                const rawValue = this.getDataValue('created_at')
                return rawValue ? dayjs(rawValue).tz('Asia/Ho_Chi_Minh').format() : null
            }
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            get() {
                const rawValue = this.getDataValue('updated_at')
                return rawValue ? dayjs(rawValue).tz('Asia/Ho_Chi_Minh').format() : null
            }
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
        underscored: true,
        hooks: {
            beforeUpdate: (instance) => {
                instance.updated_at = new Date()
            }
        }
    }
)

// Associations
SosRequest.belongsTo(CasesReport, { foreignKey: 'case_id', as: 'case' })
SosRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

export default SosRequest
