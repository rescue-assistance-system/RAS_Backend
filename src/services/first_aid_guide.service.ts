import FirstAidGuide from '../database/models/first_aid_guide.model'

export class FirstAidGuideService {
    async getAllFirstAidGuides() {
        return await FirstAidGuide.findAll()
    }

    async getFirstAidGuideById(id: number) {
        return await FirstAidGuide.findByPk(id)
    }

    async createFirstAidGuide(data: { name: string }) {
        return await FirstAidGuide.create(data)
    }

    async updateFirstAidGuide(id: number, data: { name: string }) {
        return await FirstAidGuide.update(data, { where: { id: id } })
    }

    async deleteFirstAidGuide(id: number) {
        return await FirstAidGuide.destroy({ where: { id: id } })
    }
}
