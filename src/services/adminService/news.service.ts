import { Op } from 'sequelize'
import News from '../../database/models/news.model'

export class NewsService {
    async getAllNews() {
        return await News.findAll()
    }

    async getNewsById(id: number) {
        return await News.findByPk(id)
    }

    async createNews(data: { name: string }) {
        return await News.create(data)
    }

    async updateNews(id: number, data: { name: string }) {
        return await News.update(data, { where: { id: id } })
    }

    async deleteNews(id: number) {
        return await News.destroy({ where: { id: id } })
    }

    async searchNews(query: string) {
        return await News.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${query}%`
                }
            }
        })
    }
}
