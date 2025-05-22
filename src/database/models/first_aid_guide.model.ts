import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../connection.js'
import { FirstCategory } from './first_aid_category.model.js'

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
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: FirstCategory,
                key: 'id'
            },
            onDelete: 'SET NULL'
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
