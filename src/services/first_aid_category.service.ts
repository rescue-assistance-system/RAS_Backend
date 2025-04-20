import FirstAidCategory from '../database/models/first_aid_category.model'

export class FirstAidCategoryService {
    async getAllFirstAidCategories() {
        return await FirstAidCategory.findAll()
    }

    async getFirstAidCategoryById(id: number) {
        return await FirstAidCategory.findByPk(id)
    }

    async createFirstAidCategory(data: { name: string }) {
        return await FirstAidCategory.create(data)
    }

    async updateFirstAidCategory(id: number, data: { name: string }) {
        return await FirstAidCategory.update(data, { where: { id: id } })
    }

    async deleteFirstAidCategory(id: number) {
        return await FirstAidCategory.destroy({ where: { id: id } })
    }
}
