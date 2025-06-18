import { Sequelize, DataTypes } from 'sequelize'
import sequelize from '../connection.js'
import NewsCategory from './news_category.model'
import { BaseModel } from './base.model.js'

class News extends BaseModel {}

News.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: NewsCategory,
                key: 'id'
            },
            onDelete: 'SET NULL'
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
        source: {
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
        modelName: 'News',
        tableName: 'news',
        timestamps: false,
        underscored: true
    }
)

export default News
