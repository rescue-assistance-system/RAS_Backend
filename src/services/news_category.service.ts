import NewsCategory from '../database/models/news_category.model'

export class NewsCategoryService {
    async getAllNewsCategories() {
        return await NewsCategory.findAll()
    }

    async getNewsCategoryById(id: number) {
        return await NewsCategory.findByPk(id)
    }

    async createNewsCategory(data: { name: string }) {
        return await NewsCategory.create(data)
    }

    async updateNewsCategory(id: number, data: { name: string }) {
        return await NewsCategory.update(data, { where: { id: id } })
    }

    async deleteNewsCategory(id: number) {
        return await NewsCategory.destroy({ where: { id: id } })
    }
}
