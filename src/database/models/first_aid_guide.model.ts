import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../connection.js'

class FirstAidGuide extends Model {}

FirstAidGuide.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    },
    {
        sequelize,
        modelName: 'FirstAidGuide',
        tableName: 'first_aid_guides',
        timestamps: false,
        underscored: true
    }
)

export default FirstAidGuide
