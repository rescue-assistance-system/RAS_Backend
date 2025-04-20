import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../connection.js'

class NewsCategory extends Model {}

NewsCategory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
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
        modelName: 'NewsCategory',
        tableName: 'news_categories',
        timestamps: false,
        underscored: true
    }
)

export default NewsCategory
